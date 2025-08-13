# Robotic Simulation Game

A Next.js-based simulation game where users can control robotic hands to move objects between locations using natural language prompts and image uploads. The game uses AWS Bedrock's Llama model to understand user intent.

## Features

- **Interactive 3D-like Scene**: Room with robotic hands, 10 marked locations (A-J), and various objects
- **Natural Language Processing**: Users can give prompts like "Pick and place it on location B"
- **Image Recognition**: Upload images of objects to identify what to move
- **AI-Powered Intent Understanding**: AWS Bedrock integration for intelligent command processing
- **Smooth Animations**: Framer Motion animations for robotic hand movements
- **Real-time Game State**: Dynamic object positioning and game status tracking

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **AI Integration**: AWS Bedrock (Llama 3.1 70B Instruct + Claude 3 Sonnet)
- **Icons**: Lucide React
- **Deployment**: Single Next.js deployment (client + server)

## Prerequisites

- Node.js 18+ 
- npm or yarn
- AWS Account with Bedrock access
- AWS credentials with appropriate permissions

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd sim-civ-game
npm install
```

### 2. Configure Bedrock Access

Create a `.env.local` file in the root directory:

```bash
cp env.example .env.local
```

Edit `.env.local` with your Bedrock API key (recommended) or AWS credentials:

**Option 1: Bearer Token (Recommended for inference profiles)**
```env
AWS_BEARER_TOKEN_BEDROCK=your_bearer_token_here
AWS_REGION=us-east-1
```

**Option 2: AWS Credentials (Alternative)**
```env
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
```

### 3. AWS Bedrock Setup

1. Go to AWS Console → Bedrock
2. Request access to the following models:
   - **Llama 3.1 70B Instruct** (for text processing)
   - **Claude 3 Sonnet** (for image analysis)
3. Ensure your IAM user has the following permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "bedrock:InvokeModel"
         ],
         "Resource": [
           "arn:aws:bedrock:*::foundation-model/meta.llama3-70b-instruct-v1:0",
           "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0"
         ]
       }
     ]
   }
   ```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Play

1. **Enter a Command**: Type a prompt like "Pick and place it on location B"
2. **Upload an Image**: Upload an image of the object you want to move
3. **Execute**: Click "Execute Action" to start the simulation
4. **Watch**: The robotic hands will animate and move the object to the target location
5. **Reset**: Use "Reset Game" to return objects to their original positions

## Game Objects

- **Brick** (Location A)
- **Chair** (Location B) 
- **Table** (Location C)
- **Book** (Location D)

## Available Locations

10 locations marked A through J, positioned throughout the room for strategic object placement.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── process-intent/     # AWS Bedrock integration
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # Main game interface
├── components/
│   └── SimulationScene.tsx     # 3D scene renderer
└── types/
    └── game.ts                 # TypeScript definitions
```

## API Endpoints

- `POST /api/process-intent`: Processes user prompts and images using AWS Bedrock

## Customization

### Adding New Objects

Edit `src/app/api/process-intent/route.ts`:

```typescript
const availableObjects: GameObject[] = [
  // Add new objects here
  { id: 5, name: 'lamp', type: 'lamp', location: 'E', image: '/objects/lamp.png' },
];
```

### Modifying Locations

Update the `availableLocations` array in the same file to change position coordinates.

### Changing AI Model

Modify the `modelId` in the Bedrock API call to use different models.

## Troubleshooting

### Common Issues

1. **Bedrock API Key Error**: Ensure your `.env.local` file has the correct `BEDROCK_API_KEY`
2. **AWS Credentials Error**: If using AWS credentials, ensure they have proper Bedrock permissions
3. **Bedrock Access Denied**: Request access to the models in AWS Console
4. **Model Not Found**: Verify the model IDs match exactly what's available in your region

### Debug Mode

Check browser console and terminal for detailed error messages.

## Deployment

### Vercel (Recommended)

```bash
npm run build
vercel --prod
```

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Docker containers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review AWS Bedrock documentation
3. Open an issue on GitHub
