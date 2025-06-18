# Use an official Node.js runtime as a parent image
FROM node:18-alpine As builder

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package.json ./
COPY package-lock.json ./
# If you use yarn, uncomment the next line and comment out the npm ci line
# COPY yarn.lock ./

# Install app dependencies
# Use 'npm ci' for cleaner installs if you have a package-lock.json
RUN npm ci --only=production
# If you use yarn, uncomment the next line and comment out the npm ci line
# RUN yarn install --production --frozen-lockfile

# Copy the rest of your app's source code
COPY . .

# --- Second Stage: Runtime ---
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy built assets and production dependencies from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app ./

# The port your app will run on inside the container.
# Your server.js uses process.env.PORT || 3000.
# We'll set PORT environment variable later in Amplify, or default to 3000.
EXPOSE 3000

# Define the command to run your app
CMD [ "node", "server.js" ]
