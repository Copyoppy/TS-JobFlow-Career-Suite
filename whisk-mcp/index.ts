import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ErrorCode,
    McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { Whisk } from "@rohitaryal/whisk-api";
import dotenv from "dotenv";

dotenv.config();

const COOKIE = process.env.WHISK_COOKIE;

if (!COOKIE) {
    console.error("WHISK_COOKIE environment variable is not set.");
    process.exit(1);
}

const whisk = new Whisk(COOKIE);

const server = new Server(
    {
        name: "whisk-mcp",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

/**
 * List available tools.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "generate_image",
                description: "Generate a new image using Google Whisk (Imagen 3.5)",
                inputSchema: {
                    type: "object",
                    properties: {
                        prompt: {
                            type: "string",
                            description: "The prompt to generate an image from",
                        },
                        aspectRatio: {
                            type: "string",
                            enum: ["SQUARE", "PORTRAIT", "LANDSCAPE"],
                            description: "Aspect ratio of the generated image (default: LANDSCAPE)",
                        },
                    },
                    required: ["prompt"],
                },
            },
            {
                name: "animate_image",
                description: "Animate an existing image into a video (Veo 3.1)",
                inputSchema: {
                    type: "object",
                    properties: {
                        mediaId: {
                            type: "string",
                            description: "The ID of the landscape image to animate",
                        },
                        script: {
                            type: "string",
                            description: "The script/prompt for the animation",
                        },
                    },
                    required: ["mediaId", "script"],
                },
            },
            {
                name: "refine_image",
                description: "Refine or edit an existing image",
                inputSchema: {
                    type: "object",
                    properties: {
                        mediaId: {
                            type: "string",
                            description: "The ID of the image to refine",
                        },
                        prompt: {
                            type: "string",
                            description: "The instruction for refinement (e.g., 'Add a red hat')",
                        },
                    },
                    required: ["mediaId", "prompt"],
                },
            },
            {
                name: "get_media",
                description: "Fetch information and base64 data for a generated media by ID",
                inputSchema: {
                    type: "object",
                    properties: {
                        mediaId: {
                            type: "string",
                            description: "The unique ID of the media",
                        },
                    },
                    required: ["mediaId"],
                },
            },
        ],
    };
});

/**
 * Handle tool calls.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        switch (request.params.name) {
            case "generate_image": {
                const { prompt, aspectRatio } = request.params.arguments as { prompt: string; aspectRatio?: string };
                const project = await whisk.newProject("MCP Generated Job");

                // Define aspect ratio mapping manually since library doesn't export them clearly
                const ratioMap: Record<string, string> = {
                    "SQUARE": "IMAGE_ASPECT_RATIO_SQUARE",
                    "PORTRAIT": "IMAGE_ASPECT_RATIO_PORTRAIT",
                    "LANDSCAPE": "IMAGE_ASPECT_RATIO_LANDSCAPE"
                };
                const ratioValue = ratioMap[aspectRatio || "LANDSCAPE"] || "IMAGE_ASPECT_RATIO_LANDSCAPE";

                const media = await project.generateImage({
                    prompt,
                    aspectRatio: ratioValue as any
                });

                // The whisk-api generateImage returns an array of media objects
                const results = media.map(m => ({
                    mediaId: m.mediaGenerationId,
                    prompt: m.prompt,
                    seed: m.seed
                }));

                return {
                    content: [
                        {
                            type: "text",
                            text: `Successfully generated ${results.length} image(s). MediaIDs: ${results.map(r => r.mediaId).join(", ")}`,
                        },
                    ],
                };
            }

            case "animate_image": {
                const { mediaId, script } = request.params.arguments as { mediaId: string; script: string };
                const media = await Whisk.getMedia(mediaId, whisk.account);
                const videoMedia = await media.animate(script);

                return {
                    content: [
                        {
                            type: "text",
                            text: `Animation request sent. Video MediaID: ${videoMedia.mediaGenerationId}`,
                        },
                    ],
                };
            }

            case "refine_image": {
                const { mediaId, prompt } = request.params.arguments as { mediaId: string; prompt: string };
                const media = await Whisk.getMedia(mediaId, whisk.account);
                const refinedMedia = await media.refine(prompt);

                return {
                    content: [
                        {
                            type: "text",
                            text: `Refinement successful. New MediaID: ${refinedMedia.mediaGenerationId}`,
                        },
                    ],
                };
            }

            case "get_media": {
                const { mediaId } = request.params.arguments as { mediaId: string };
                const media = await Whisk.getMedia(mediaId, whisk.account);

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                mediaId: media.mediaGenerationId,
                                prompt: media.prompt,
                                mediaType: media.mediaType,
                                aspectRatio: media.aspectRatio,
                            }, null, 2),
                        },
                    ],
                };
            }

            default:
                throw new McpError(
                    ErrorCode.MethodNotFound,
                    `Unknown tool: ${request.params.name}`
                );
        }
    } catch (error: any) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
});

/**
 * Start the server.
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Whisk MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
