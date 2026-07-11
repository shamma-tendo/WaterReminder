import * as readline from "readline";

interface HydrationState {
  intervalMinutes: number;
  timeLeft: number;
  drinksCount: number;
  isSnoozed: boolean;
  timerRunning: boolean;
}

class HydrationBuddy {
  private state: HydrationState;
  private walkingFrames: string[] = ["🚶", "🧘", "🏃", "🧘"];
  private frameIndex: number = 0;
  private timerInterval: NodeJS.Timeout | null = null;
  private rl: readline.Interface;

  constructor() {
    this.state = {
      intervalMinutes: 30,
      timeLeft: 30,
      drinksCount: 0,
      isSnoozed: false,
      timerRunning: true,
    };

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  private clearScreen(): void {
    console.clear();
  }

  private printHeader(): void {
    console.log("\n");
    console.log("\x1b[44m\x1b[1m\x1b[34m");
    console.log("    💧 Hydration Buddy - Stay hydrated while you code");
    console.log("\x1b[0m\n");
  }

  private printSeparator(): void {
    console.log("\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m");
  }

  private printMainMenu(): void {
    this.clearScreen();
    this.printHeader();

    console.log("\x1b[1m📊 Current Status:\x1b[0m");
    this.printSeparator();

    console.log(
      `\x1b[1m⏱  Time until next reminder:\x1b[0m \x1b[1m\x1b[34m${this.state.timeLeft}\x1b[0m minutes`
    );
    console.log(
      `\x1b[1m💧 Times hydrated today:\x1b[0m \x1b[1m\x1b[32m${this.state.drinksCount}\x1b[0m\n`
    );

    if (this.state.isSnoozed) {
      console.log(
        `\x1b[1m✓ Status:\x1b[0m Snoozed (reminder in ${this.state.timeLeft} minute${this.state.timeLeft !== 1 ? "s" : ""})\n`
      );
    } else {
      console.log(
        `\x1b[1m✓ Status:\x1b[0m Timer active (reminder in ${this.state.timeLeft} minute${this.state.timeLeft !== 1 ? "s" : ""})\n`
      );
    }

    console.log("\x1b[1m🔔 Reminder Interval:\x1b[0m");
    const intervals = [15, 20, 30, 45, 60];
    const intervalDisplay = intervals
      .map((interval) =>
        interval === this.state.intervalMinutes
          ? `\x1b[1m\x1b[32m[${interval}]\x1b[0m`
          : `[${interval}]`
      )
      .join(" ");
    console.log(`  ${intervalDisplay}\n`);

    console.log("\x1b[1m📋 Menu:\x1b[0m");
    this.printSeparator();
    console.log("  \x1b[1m\x1b[36m1\x1b[0m - Set interval to 15 minutes");
    console.log("  \x1b[1m\x1b[36m2\x1b[0m - Set interval to 20 minutes");
    console.log("  \x1b[1m\x1b[36m3\x1b[0m - Set interval to 30 minutes (default)");
    console.log("  \x1b[1m\x1b[36m4\x1b[0m - Set interval to 45 minutes");
    console.log("  \x1b[1m\x1b[36m5\x1b[0m - Set interval to 60 minutes");
    console.log("  \x1b[1m\x1b[36m6\x1b[0m - Show reminder now (test)");
    console.log("  \x1b[1m\x1b[36m7\x1b[0m - Drink water (reset timer)");
    console.log("  \x1b[1m\x1b[36m8\x1b[0m - Snooze for 5 minutes");
    console.log("  \x1b[1m\x1b[36m0\x1b[0m - Exit\n");
  }

  private async showReminder(): Promise<void> {
    this.clearScreen();
    this.printHeader();

    console.log("\n");
    console.log("                        " + this.walkingFrames[0] + "\n");
    console.log("\n");
    console.log("\x1b[1m\x1b[34m                    💧 Time to hydrate! 💧\x1b[0m\n");
    console.log("\x1b[36m    Your brain works better when you're hydrated.\x1b[0m");
    console.log("\x1b[36m    Take a sip of water and keep coding! 🚀\x1b[0m");
    console.log("\n");
    this.printSeparator();
    console.log("\n\x1b[1m\x1b[32m1\x1b[0m - Yes, I drank water ✓");
    console.log("\x1b[1m\x1b[33m2\x1b[0m - Snooze for 5 minutes ⏱\n");

    const choice = await this.question("Enter your choice: ");

    if (choice === "1") {
      this.state.drinksCount++;
      this.state.timeLeft = this.state.intervalMinutes;
      this.state.isSnoozed = false;
      console.log(
        "\n\x1b[1m\x1b[32m✓ Great! Keep up the hydration!\x1b[0m\n"
      );
      await this.delay(2000);
    } else if (choice === "2") {
      this.state.timeLeft = 5;
      this.state.isSnoozed = true;
      console.log(
        "\n\x1b[1m\x1b[33m⏱ Snoozed for 5 minutes. Next reminder soon!\x1b[0m\n"
      );
      await this.delay(2000);
    }
  }

  private setInterval(minutes: number): void {
    this.state.intervalMinutes = minutes;
    this.state.timeLeft = minutes;
    this.state.isSnoozed = false;
    console.log(
      `\x1b[1m\x1b[32m✓ Reminder interval set to ${minutes} minutes\x1b[0m`
    );
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.state.timeLeft > 0) {
        this.state.timeLeft--;
      } else if (this.state.timeLeft === 0 && this.state.timerRunning) {
        this.showReminder().then(() => {
          this.state.timeLeft = this.state.intervalMinutes;
          this.printMainMenu();
          this.promptUser();
        });
      }
    }, 60000); // 1 minute
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  private async promptUser(): Promise<void> {
    const choice = await this.question("");

    switch (choice) {
      case "1":
        this.setInterval(15);
        await this.delay(1000);
        this.printMainMenu();
        this.promptUser();
        break;
      case "2":
        this.setInterval(20);
        await this.delay(1000);
        this.printMainMenu();
        this.promptUser();
        break;
      case "3":
        this.setInterval(30);
        await this.delay(1000);
        this.printMainMenu();
        this.promptUser();
        break;
      case "4":
        this.setInterval(45);
        await this.delay(1000);
        this.printMainMenu();
        this.promptUser();
        break;
      case "5":
        this.setInterval(60);
        await this.delay(1000);
        this.printMainMenu();
        this.promptUser();
        break;
      case "6":
        await this.showReminder();
        this.printMainMenu();
        this.promptUser();
        break;
      case "7":
        this.state.drinksCount++;
        this.state.timeLeft = this.state.intervalMinutes;
        this.state.isSnoozed = false;
        console.log("\x1b[1m\x1b[32m✓ Water intake recorded!\x1b[0m");
        await this.delay(1000);
        this.printMainMenu();
        this.promptUser();
        break;
      case "8":
        this.state.timeLeft = 5;
        this.state.isSnoozed = true;
        console.log("\x1b[1m\x1b[33m⏱ Snoozed for 5 minutes\x1b[0m");
        await this.delay(1000);
        this.printMainMenu();
        this.promptUser();
        break;
      case "0":
        this.state.timerRunning = false;
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
        }
        console.log("\n\x1b[1m\x1b[36m👋 Stay hydrated! Goodbye!\x1b[0m\n");
        this.rl.close();
        process.exit(0);
        break;
      default:
        console.log(
          "\x1b[1m✗ Invalid choice. Please try again.\x1b[0m"
        );
        await this.delay(1000);
        this.printMainMenu();
        this.promptUser();
    }
  }

  public async run(): Promise<void> {
    this.printMainMenu();
    this.startTimer();
    this.promptUser();
  }
}

const app = new HydrationBuddy();
app.run().catch(console.error);