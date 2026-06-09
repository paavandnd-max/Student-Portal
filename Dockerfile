# Use a lightweight Node.js runtime image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to cache npm install layer
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy the rest of the application files
COPY . .

# Expose the default server port
EXPOSE 3000

# Set environment variables (Render automatically overrides PORT)
ENV PORT=3000
ENV NODE_ENV=production

# Start the Express server
CMD [ "node", "server.js" ]
