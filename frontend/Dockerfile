# Production image, copy all the files and run next
FROM node:alpine AS runner
WORKDIR /app
COPY . .
# Install certificates
RUN apk update && apk add --no-cache ca-certificates && update-ca-certificates
ENV NODE_ENV production

EXPOSE 3000

CMD ["npx", "next", "start"]
LABEL org.opencontainers.image.source="https://github.com/omnistrate-community/ai-chatbot"
