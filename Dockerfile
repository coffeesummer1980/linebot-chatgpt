# Node.js 18のLTSイメージを使用
FROM node:18-alpine

# アプリケーションディレクトリを作成
WORKDIR /usr/src/app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci --only=production

# アプリケーションコードをコピー
COPY . .

# アプリケーションが使用するポートを公開
EXPOSE 3000

# アプリケーションを起動
CMD ["npm", "start"]