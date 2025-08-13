import { NextRequest, NextResponse } from 'next/server';
import { Location, GameObject, IntentResult } from '@/types/game';

// Bedrock API configuration
const BEDROCK_REGION = process.env.AWS_REGION || 'us-east-1';
const BEDROCK_BASE_URL = `https://bedrock-runtime.${BEDROCK_REGION}.amazonaws.com`;
const BEARER_TOKEN = process.env.AWS_BEARER_TOKEN_BEDROCK;

// Helper function to format the authorization header
function getAuthHeader() {
  if (!BEARER_TOKEN) return '';
  
  // If token already starts with "Bearer ", use as is
  if (BEARER_TOKEN.startsWith('Bearer ')) {
    return BEARER_TOKEN;
  }
  
  // Otherwise, add "Bearer " prefix
  return `Bearer ${BEARER_TOKEN}`;
}

// Sample game objects for demonstration
const availableObjects: GameObject[] = [
  { id: 1, name: 'brick', type: 'brick', location: 'A', image: '/objects/brick.png' },
  { id: 2, name: 'chair', type: 'chair', location: 'B', image: '/objects/chair.png' },
  { id: 3, name: 'table', type: 'table', location: 'C', image: '/objects/table.png' },
  { id: 4, name: 'book', type: 'book', location: 'D', image: '/objects/book.png' },
];

const availableLocations: Location[] = [
  { id: 'A', x: 100, y: 200, label: 'A' },
  { id: 'B', x: 300, y: 200, label: 'B' },
  { id: 'C', x: 500, y: 200, label: 'C' },
  { id: 'D', x: 100, y: 400, label: 'D' },
  { id: 'E', x: 300, y: 400, label: 'E' },
  { id: 'F', x: 500, y: 400, label: 'F' },
  { id: 'G', x: 100, y: 600, label: 'G' },
  { id: 'H', x: 300, y: 600, label: 'H' },
  { id: 'I', x: 500, y: 600, label: 'I' },
  { id: 'J', x: 700, y: 400, label: 'J' },
];

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting intent processing...');
    console.log('Environment check:');
    console.log('- BEDROCK_REGION:', BEDROCK_REGION);
    console.log('- BEDROCK_BASE_URL:', BEDROCK_BASE_URL);
    console.log('- BEARER_TOKEN set:', !!BEARER_TOKEN);
    
    const formData = await request.formData();
    const prompt = formData.get('prompt') as string;
    const image = formData.get('image') as File;

    console.log('📝 Received prompt:', prompt);
    console.log('🖼️  Received image:', image ? `File(${image.name}, ${image.size} bytes, ${image.type})` : 'None');

    if (!prompt) {
      return NextResponse.json({
        success: false,
        message: 'Prompt is required',
      } as IntentResult);
    }

    // Image upload is optional now (kept for future use)
    console.log('🔍 Image upload status:', image ? `File(${image.name}, ${image.size} bytes)` : 'None');

    // Image upload kept for UI but not processed for now
    console.log('🖼️  Image uploaded but not processed (using text-only mode)');

    // Prepare prompts for different scenarios
    const baseSystemPrompt = `You are an AI assistant that helps understand user intent in a robotic simulation game. 
    
    Available objects in the game:
    ${availableObjects.map(obj => `- ${obj.name} (${obj.type}) at location ${obj.location}`).join('\n')}
    
    Available locations: ${availableLocations.map(loc => loc.id).join(', ')}
    
    The user wants to move an object. Determine:
    1. Which object they want to move
    2. Which location they want to move it to
    
    CRITICAL: Your response must be EXACTLY in this JSON format with NO additional text, explanations, or formatting:
    
    {"objectId":"chair","targetLocationId":"F","confidence":0.9,"reasoning":"Brief explanation"}
    
    Rules:
    - objectId: must be one of the available object names (brick, chair, table, book)
    - targetLocationId: must be one of the available location IDs (A, B, C, D, E, F, G, H, I, J)
    - confidence: number between 0 and 1
    - reasoning: brief explanation in quotes
    - NO markdown, NO code blocks, NO additional text before or after the JSON
    - The response must start with { and end with }`;

    // Always use Llama 3.1 70B for text processing (simpler and cheaper)
    console.log('Using Llama 3.1 70B for text processing');
    const aiResponse = await processWithLlama(prompt, baseSystemPrompt);
    console.log('🔍 AI Response:', aiResponse);
    debugger;

    // Validate the AI response
    if (!aiResponse.objectId || !aiResponse.targetLocationId) {
      return NextResponse.json({
        success: false,
        message: 'Could not determine object or target location from the prompt',
      } as IntentResult);
    }

    // Find the object and location
    const object = availableObjects.find(obj => obj.name === aiResponse.objectId);
    const location = availableLocations.find(loc => loc.id === aiResponse.targetLocationId);

    if (!object || !location) {
      return NextResponse.json({
        success: false,
        message: 'Invalid object or location specified',
      } as IntentResult);
    }

    return NextResponse.json({
      success: true,
      object,
      location,
      message: `Moving ${object.name} to location ${location.id}`,
      confidence: aiResponse.confidence || 0.8,
      reasoning: aiResponse.reasoning || 'AI analysis completed',
    } as IntentResult);

  } catch (error) {
    console.error('Error processing intent:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to process intent',
    } as IntentResult, { status: 500 });
  }
}

// Claude function removed - using Llama only for now

// Process intent using Llama 3.1 70B Instruct (for text-only processing - better quality)
async function processWithLlama(prompt: string, systemPrompt: string) {
  const fullPrompt = `${systemPrompt}\n\nUser prompt: "${prompt}"\n\nIMPORTANT: Respond with ONLY the JSON object. No explanations, no markdown, no additional text. Just the pure JSON starting with { and ending with }.`;

  const authHeader = getAuthHeader();
  
  const requestBody = {
    messages: [
      {
        role: 'user',
        content: [
          {
            text: fullPrompt
          }
        ]
      }
    ]
  };

  console.log('🔍 Llama API Request Details:');
  console.log('URL:', `${BEDROCK_BASE_URL}/model/arn%3Aaws%3Abedrock%3Aus-east-1%3A343218181127%3Ainference-profile%2Fus.meta.llama3-1-70b-instruct-v1%3A0/converse`);
  console.log('Headers:', {
    'Content-Type': 'application/json',
    'Authorization': authHeader ? authHeader.substring(0, 20) + '...' : 'NOT_SET',
  });
  console.log('Request Body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(
    `${BEDROCK_BASE_URL}/model/arn%3Aaws%3Abedrock%3Aus-east-1%3A343218181127%3Ainference-profile%2Fus.meta.llama3-1-70b-instruct-v1%3A0/converse`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(requestBody),
    }
  );

  console.log('🔍 Llama API Response Details:');
  console.log('Status:', response.status);
  console.log('Status Text:', response.statusText);
  console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.log('❌ Error Response Body:', errorText);
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }

  const responseBody = await response.json();

  try {
    // Extract text from the correct response structure
    const responseText = responseBody.output?.message?.content?.[0]?.text || '';
    console.log('🔍 Raw Llama response text:', responseText);
    
    // Try to parse the response directly as JSON first
    try {
      const parsedJson = JSON.parse(responseText.trim());
      console.log('✅ Successfully parsed clean JSON:', parsedJson);
      return parsedJson;
    } catch (directParseError) {
      // Fallback: look for JSON in the response text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedJson = JSON.parse(jsonMatch[0]);
        console.log('✅ Successfully parsed JSON from text:', parsedJson);
        return parsedJson;
      } else {
        console.log('❌ No JSON found in response text');
        throw new Error('No JSON found in response');
      }
    }
  } catch (parseError) {
    console.error('Failed to parse Llama response:', parseError);
    return parseIntentFromText(prompt, responseBody.output?.message?.content?.[0]?.text || '');
  }
}

// Fallback function to parse intent from text if JSON parsing fails
function parseIntentFromText(prompt: string, aiResponse: string): {
  objectId: number | null;
  targetLocationId: string | null;
  confidence: number;
  reasoning: string;
} {
  const promptLower = prompt.toLowerCase();
  
  // Extract target location from prompt
  let targetLocationId = null;
  for (const location of availableLocations) {
    if (promptLower.includes(`location ${location.id}`) || promptLower.includes(location.id.toLowerCase())) {
      targetLocationId = location.id;
      break;
    }
  }

  // Simple object matching based on common terms
  let objectId = null;
  if (promptLower.includes('brick') || aiResponse.toLowerCase().includes('brick')) {
    objectId = 1;
  } else if (promptLower.includes('chair') || aiResponse.toLowerCase().includes('chair')) {
    objectId = 2;
  } else if (promptLower.includes('table') || aiResponse.toLowerCase().includes('table')) {
    objectId = 3;
  } else if (promptLower.includes('book') || aiResponse.toLowerCase().includes('book')) {
    objectId = 4;
  }

  return {
    objectId,
    targetLocationId,
    confidence: 0.6,
    reasoning: 'Fallback parsing used due to AI response parsing failure',
  };
} 