# Use Node.js base image
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy entire project
COPY . .

EXPOSE 3000

# Start React development server
CMD ["npm", "start"]
