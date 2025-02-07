#!/bin/bash

# Install required TypeScript dependencies if not already present
npm install --save-dev typescript @types/node @types/mongoose @types/bcryptjs

# Initialize TypeScript configuration if not present
if [ ! -f "tsconfig.json" ]; then
  echo '{
    "compilerOptions": {
      "target": "es2017",
      "lib": ["dom", "dom.iterable", "esnext"],
      "allowJs": true,
      "skipLibCheck": true,
      "strict": true,
      "forceConsistentCasingInFileNames": true,
      "noEmit": true,
      "esModuleInterop": true,
      "module": "esnext",
      "moduleResolution": "node",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "jsx": "preserve",
      "incremental": true,
      "plugins": [
        {
          "name": "next"
        }
      ],
      "paths": {
        "@/*": ["./src/*"]
      }
    },
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
    "exclude": ["node_modules"]
  }' > tsconfig.json
fi

# Create types directory if it doesn't exist
mkdir -p src/types

# Create base types file
echo 'import { Document } from "mongoose";

export interface TimeStamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseDocument extends Document, TimeStamps {}' > src/types/common.ts

echo "TypeScript configuration complete. Please run 'npm run dev' to check for any type errors."
