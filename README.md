# 🃏 Card Game

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)

## 🎯 Description
A simple **two-player** card game. All cards are visible to both players. The first player to get rid of all their cards wins! 🤺

## 🔥 Rules
- The game uses **36 cards** (excluding 8s and 9s).
- **Lower cards beat higher cards** (e.g., 14 is the weakest, 1 (Ace) is the strongest).
- Each player starts with **4 cards**.
- A player can play **up to 3 cards per turn**.
- After a turn, players **draw cards** from the deck to maintain 4 cards in hand.
- If a player **fails to beat a card**, the unbeaten cards go to the discard pile, but the player must draw additional cards **on top of the 4** and **miss their next turn**.
- If a player has **3 cards of the same rank**, they get an **extra turn** out of sequence.
- **The first player to get rid of all cards wins!** 🏆

## 🚀 How to Run
```bash
# Install dependencies for both frontend and server
npm run install:all

# Start the game (server + frontend)
npm run start
```

⚡ If you encounter "Permission denied" on macOS

If you see an error like Permission denied when trying to run the server, you may need to grant execute permissions to some files. Run the following commands:

🖥️ For macOS Terminal, run:
```
chmod +x server/node_modules/.bin/nodemon
chmod +x server/node_modules/.bin/tsx
```

Then, try starting the server again:
npm run start

## 📸 Screenshots
![Gameplay Screenshot Attack](/shared/assets/attack.png)
![Gameplay Screenshot Defense](/shared/assets/defense.png)
![Gameplay Screenshot Multiplayer](/shared/assets/manyPlayers.png)

## 📜 License
This project is licensed under the MIT License. 📝

