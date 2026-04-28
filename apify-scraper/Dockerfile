FROM apify/actor-node:20

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev --no-fund --no-audit

COPY . ./

CMD ["node", "src/main.js"]
