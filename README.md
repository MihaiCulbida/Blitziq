# BlitzIQ

A quiz platform where you can create, share and play timed quizzes. Built with PHP, vanilla JavaScript and SCSS — no frameworks, no SQL database. All data is stored in flat JSON files.

---

## Requirements

- PHP 7.4+
- Apache / Nginx with PHP support (XAMPP, Laragon, or PHP built-in server)

## Running locally

Clone the repo and start the server:

```bash
git clone https://github.com/MihaiCulbida/blitziq.git
cd blitziq
php -S localhost:8000
```

Open `http://localhost:8000` in your browser. Make sure the `data/` folder is writable so PHP can read and write JSON files:

```bash
chmod 755 data/
```

If you're using XAMPP or Laragon, copy the folder into `htdocs/` or `www/` and access it at `http://localhost/blitziq/`.

---

## Landing page

The landing page introduces the platform with a 3D animated hero section, a features overview and an interactive PHP demo quiz with 3 questions. From here you can register, log in, switch languages and read the terms and privacy policy.

---

## Getting started

**Sign up** — click Sign up in the navbar, fill in a username (3–30 characters), email and password (min. 8 characters). After submitting you'll be redirected straight to the dashboard.

**Log in** — use your email or username and password. Your session persists until you log out.

**Log out** — click your avatar in the top right, then Log out. You can also log out from the sidebar settings.

---

## Dashboard

The dashboard has three main sections accessible from the navbar: **Home**, **My Quizzes** and **Discover**.

**Home** shows a Daily Quiz banner, a Trending row and a Recommended row with cards you can click to play.

**My Quizzes** lists all quizzes you've created, showing their status (Draft or Published), how many questions are filled in and a quick Edit button.

**Discover** lets you browse all public quizzes. Use the filter buttons at the top to narrow down by category, or type in the search bar in the navbar to search across everything in real time.

---

## Creating a quiz

Click **New quiz** in the navbar. A 3-step wizard opens:

1. **General info** — give your quiz a name (required), an optional description, pick a subject and language, and set visibility to Public, Private or Draft.
2. **Quiz structure** — set the number of questions (1–100), time per question (5–300 seconds) and how many answer choices per question (2–6).
3. **Settings** — configure question order (fixed or random), answer order, allowed attempts, minimum pass score and points per correct answer. You can also toggle display options like showing the final score or correct answers after each question. A summary of your config is shown before you confirm.

Click **Create quiz** and the editor opens automatically.

---

## Editing a quiz

The editor has a sidebar on the left listing all your questions and a main panel on the right.

Click any question in the sidebar to jump to it. For each question you can:

- Write the question text in the textarea
- Set a custom time and point value for that specific question
- Change the question type — **Single** (one correct answer), **Multiple** (several correct) or **True/False** (forces two choices)
- Click the checkmark icon on any answer row to mark it as correct
- Add more answer rows with the **Add answer** button (up to 6)
- Remove answer rows with the × button (minimum 2 remain)
- Delete entire questions from the sidebar (with a confirmation prompt)
- Add new questions with the **Add question** button at the bottom of the sidebar (up to 100)

Use the **Save** button in the topbar to save without publishing. The **Folder** button lets you assign the quiz to one of your sidebar folders. When the quiz is ready, click **Publish quiz** — the status changes to Published and a notification appears in the bell icon.

---

## Playing a quiz

Click any quiz card anywhere in the dashboard to open the start screen. It shows the quiz title, question count, time per question, points and pass score. You can also save the quiz to your Favorites from here.

Click **Start quiz**. A 3-2-1 animated countdown runs, then the quiz opens fullscreen:

- The question appears at the top on a white background
- Answer buttons fill the bottom half, each with a color and a letter (A–F)
- A timer counts down in the top right — it turns yellow below 10 seconds and red below 5
- Your current score is shown in the top right as a gold pill

After picking an answer, feedback appears immediately: a green banner for correct (showing how many points you earned) or a red banner showing the correct answer. Then click **Next** or press `Enter` to continue.

If you're unsure about a question you can click **Skip** — it goes to the end of the queue and you'll get a chance to answer it after all other questions are done.

**Keyboard shortcuts:** press `1` through `6` to pick an answer, `Enter` to go to the next question after answering, `Esc` to exit the quiz at any time.

At the end, a results screen shows your total score, how many you got correct, your accuracy percentage and the total time taken. You can retry the quiz or go back to the dashboard. Every session is automatically saved to your History.

---

## Sidebar

The sidebar on the left side of the dashboard gives you quick access to your collections.

**Folders** — click the **New folder** item to create a folder (up to 6 total). Folders can be renamed inline and reordered by dragging. Inside the editor, you can assign a quiz to any folder using the Folder button. Click a folder in the sidebar to expand its quizzes.

**Favorites** — quizzes you save from the start screen appear here. Click any to open the start screen directly.

**History** — opens a side panel listing every quiz session you've played, with the date, score, accuracy and time.

---

## Settings and appearance

Open **Settings** at the bottom of the sidebar to access:

- **Theme** — toggles between light and dark mode. The preference is saved in localStorage.
- **Language** — switch between English, Romanian and Russian. All UI text updates instantly including quiz cards, modals and error messages.

The same language switcher is available in the navbar on the landing page.

---

## Notifications

When you publish a quiz, a notification appears in the bell icon in the navbar. The bell shows a red dot when there are unread notifications. Click the bell to open the notifications panel — you can mark items as read by clicking them, delete individual notifications with the × button, or clear all at once.
