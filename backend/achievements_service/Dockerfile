# Use an official lightweight Node image
FROM node:20-alpine

# Set working directory in container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependiencies in container
RUN npm install --production

# Create data directory for crash storage
RUN mkdir -p /data

# Copy the rest of project file
COPY . .

# Expose port for documentation
EXPOSE 3000

# Start the server
CMD ["npm", "start"]