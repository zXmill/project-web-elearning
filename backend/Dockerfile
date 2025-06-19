# Use an official Node.js runtime as a parent image
FROM node:18-alpine As builder

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json ./
COPY package-lock.json ./

# Install app dependencies, including devDependencies for sequelize-cli
RUN npm ci
# If you use yarn, ensure devDependencies are installed:
# COPY yarn.lock ./
# RUN yarn install --frozen-lockfile

# Copy the rest of your app's source code
COPY . .

# --- Second Stage: Runtime ---
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy built assets and ALL dependencies (including dev for migrations) from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app ./

# The port your app will run on inside the container.
EXPOSE 3000

# Define the command to run migrations and then your app
# This uses the "db:migrate" script from your package.json
CMD ["sh", "-c", "npm run db:migrate && node server.js"]
