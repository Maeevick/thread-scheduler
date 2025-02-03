# 🎭 THREAD-SCHEDULER - A PoC to schedule riched threaded-posts on BlueSky and Threads

Because solving one problem by creating three more interesting ones is just fun!

## 🤹 What's This Chaos?

A probably overcomplicated solution to post threads on BlueSky and Threads at scheduled times. Built because my "2-key Stack Overflow keyboard" was on strike, and I needed something to do while waiting to pick my next side project.

## 🔎 The Grand Tour

- `src/`: Where the magic (and bugs) live
- `content/`: Your future threads, following the sacred naming convention
- `static/`: Images, memes, and other visual entertainment

## 🎯 How It (Should) Work

1. Create a thread file in `content/` following this format:

   ```
   YYYYMMDDTHHMM.json
   ```

   Yes, that's UTC time because we like to make things ~~complicated~~ precise!

2. Write your thread content:

   ```json
   {
   	"scheduledFor": "2025-02-01T20:00:00Z", // Currently, used as reference only. Actual scheduling is based on filename.
   	"posts": [
   		{
   			"content": "Your brilliant thoughts here",
   			"image": {
   				"uri": "https://raw.githubusercontent.com/...",
   				"alt": "A picture worth 1000 posts"
   			},
   			"tag": "#chaos"
   		}
   	]
   }
   ```

3. Infrastructure not included:
   - You'll need:
     - A container runtime
     - A scheduler/cron service of your choice
   - For reference, I use:
     - Docker image
     - A Serverless Job from Scaleway
     - GitHub Actions to handle complicated stuff

## 🎪 Local Development (aka The Testing Circus)

First, you'll need to set up your social media API credentials:

1. **Threads/Meta API**:

   - Create a [Meta Developer Account](https://developers.facebook.com/)
   - Create a new App
   - Enable Thread API
   - Generate a long-lived token

2. **BlueSky API**:
   - You'll need your BlueSky identifier and password

Then:

```bash
# Clone this circus
git clone https://github.com/Maeevick/thread-scheduler.git

# Install the bazaar
npm i

# Create and configure your .env
cp .env.example .env

# Start the debugging
npm start
```

## 🐛 Found a Bug? (Of Course You Did!)

Issues are welcome! Feel free to:

- 🪲 Report bugs
- 💡 Suggest features
- 🎨 Share memes
- 🤔 Question my life choices

Just head to the [Issues](https://github.com/Maeevick/thread-scheduler/issues) section.

## 🤝 Want to Contribute? (Really?)

1. Fork it like you mean it
2. Create your feature branch with conventional naming:
   ```bash
   git switch -c feat/awesome-feature
   # or
   git switch -c fix/terrible-bug
   ```
3. Commit with conventional commits:
   ```bash
   git commit -m "feat: add more chaos"
   # or
   git commit -m "fix: make it slightly less chaotic"
   ```
4. Push to your branch
5. Create a Pull Request
6. Cross your fingers

Convention examples:

- Branches: `feat/`, `fix/`, `chore/`, `docs/`
- Commits: `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `refactor:`
- Full example: `feat: add automatic thread generation from random tweets`

## 📜 License

MIT License - Because sharing is caring, and chaos should be free!

---

Built with ❤️ and questionable decisions by [Maeevick](https://github.com/Maeevick)

_PS: If this works, it's a feature. If it doesn't, it's a "creative interpretation of requirements"._
