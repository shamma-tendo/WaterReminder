use std::io::{self, Write};
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::time::{sleep, Duration};

#[derive(Debug, Clone)]
struct HydrationState {
    interval_minutes: i32,
    time_left: i32,
    drinks_count: i32,
    is_snoozed: bool,
    timer_running: bool,
}

// ANSI color codes
const RESET: &str = "\x1b[0m";
const BOLD: &str = "\x1b[1m";
const BLUE: &str = "\x1b[34m";
const CYAN: &str = "\x1b[36m";
const GREEN: &str = "\x1b[32m";
const YELLOW: &str = "\x1b[33m";
const BG_BLUE: &str = "\x1b[44m";

const WALKING_FRAMES: &[&str] = &["🚶", "🧘", "🏃", "🧘"];

fn clear_screen() {
    print!("\x1B[2J\x1B[1;1H");
    io::stdout().flush().unwrap();
}

fn print_header() {
    println!();
    println!("{}{}{}    💧 Hydration Buddy - Stay hydrated while you code{}", 
             BG_BLUE, BOLD, BLUE, RESET);
    println!();
}

fn print_separator() {
    println!("{}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{}", CYAN, RESET);
}

async fn print_main_menu(state: &HydrationState) {
    clear_screen();
    print_header();

    println!("{}📊 Current Status:{}", BOLD, RESET);
    print_separator();

    println!(
        "{}⏱  Time until next reminder:{} {}{}{}  minutes",
        BOLD, RESET, BOLD, BLUE, state.time_left
    );
    println!(
        "{}💧 Times hydrated today:{} {}{}{}",
        BOLD, RESET, BOLD, GREEN, state.drinks_count
    );
    println!();

    let status_msg = if state.is_snoozed {
        format!(
            "{}✓ Status:{} Snoozed (reminder in {} minute{})",
            BOLD,
            RESET,
            state.time_left,
            if state.time_left != 1 { "s" } else { "" }
        )
    } else {
        format!(
            "{}✓ Status:{} Timer active (reminder in {} minute{})",
            BOLD,
            RESET,
            state.time_left,
            if state.time_left != 1 { "s" } else { "" }
        )
    };
    println!("{}\n", status_msg);

    println!("{}🔔 Reminder Interval:{}", BOLD, RESET);
    print!("  ");
    let intervals = vec![15, 20, 30, 45, 60];
    for interval in intervals {
        if interval == state.interval_minutes {
            print!("{}[{}]{} ", BOLD + GREEN, interval, RESET);
        } else {
            print!("[{}] ", interval);
        }
    }
    println!("\n");

    println!("{}📋 Menu:{}", BOLD, RESET);
    print_separator();
    println!("  {}1{} - Set interval to 15 minutes", BOLD + CYAN, RESET);
    println!("  {}2{} - Set interval to 20 minutes", BOLD + CYAN, RESET);
    println!("  {}3{} - Set interval to 30 minutes (default)", BOLD + CYAN, RESET);
    println!("  {}4{} - Set interval to 45 minutes", BOLD + CYAN, RESET);
    println!("  {}5{} - Set interval to 60 minutes", BOLD + CYAN, RESET);
    println!("  {}6{} - Show reminder now (test)", BOLD + CYAN, RESET);
    println!("  {}7{} - Drink water (reset timer)", BOLD + CYAN, RESET);
    println!("  {}8{} - Snooze for 5 minutes", BOLD + CYAN, RESET);
    println!("  {}0{} - Exit", BOLD + CYAN, RESET);
    print!("\n{}Enter your choice: {}", BOLD, RESET);
    io::stdout().flush().unwrap();
}

async fn show_reminder(state: &mut HydrationState) {
    clear_screen();
    print_header();

    println!();
    println!("                        {}\n", WALKING_FRAMES[0]);
    println!();
    println!(
        "{}{}💧 Time to hydrate! 💧{}",
        BOLD, BLUE,
        RESET
    );
    println!();
    println!("{}Your brain works better when you're hydrated.{}", CYAN, RESET);
    println!("{}Take a sip of water and keep coding! 🚀{}\n", CYAN, RESET);

    print_separator();
    println!("\n{}1{} - Yes, I drank water ✓", BOLD + GREEN, RESET);
    println!("{}2{} - Snooze for 5 minutes ⏱\n", BOLD + YELLOW, RESET);
    print!("Enter your choice: ");
    io::stdout().flush().unwrap();

    let mut choice = String::new();
    io::stdin().read_line(&mut choice).unwrap();
    let choice = choice.trim();

    if choice == "1" {
        state.drinks_count += 1;
        state.time_left = state.interval_minutes;
        state.is_snoozed = false;
        println!("\n{}✓ Great! Keep up the hydration!{}\n", GREEN + BOLD, RESET);
    } else if choice == "2" {
        state.time_left = 5;
        state.is_snoozed = true;
        println!(
            "\n{}⏱ Snoozed for 5 minutes. Next reminder soon!{}\n",
            YELLOW + BOLD, RESET
        );
    }

    sleep(Duration::from_secs(2)).await;
}

fn set_interval(state: &mut HydrationState, minutes: i32) {
    state.interval_minutes = minutes;
    state.time_left = minutes;
    state.is_snoozed = false;
    println!(
        "{}✓ Reminder interval set to {} minutes{}",
        GREEN + BOLD, minutes, RESET
    );
}

fn get_input() -> String {
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
    input.trim().to_string()
}

#[tokio::main]
async fn main() {
    let state = Arc::new(Mutex::new(HydrationState {
        interval_minutes: 30,
        time_left: 30,
        drinks_count: 0,
        is_snoozed: false,
        timer_running: true,
    }));

    let state_clone = Arc::clone(&state);

    // Timer task
    let timer_task = tokio::spawn(async move {
        loop {
            sleep(Duration::from_secs(60)).await;

            let mut state = state_clone.lock().await;
            if !state.timer_running {
                break;
            }

            state.time_left -= 1;

            if state.time_left <= 0 {
                state.time_left = state.interval_minutes;
                drop(state); // Release lock before showing reminder
            }
        }
    });

    // Main loop
    loop {
        let mut current_state = state.lock().await;

        print_main_menu(&current_state).await;
        drop(current_state); // Release lock during input

        let choice = get_input();
        let mut current_state = state.lock().await;

        match choice.as_str() {
            "1" => {
                set_interval(&mut current_state, 15);
            }
            "2" => {
                set_interval(&mut current_state, 20);
            }
            "3" => {
                set_interval(&mut current_state, 30);
            }
            "4" => {
                set_interval(&mut current_state, 45);
            }
            "5" => {
                set_interval(&mut current_state, 60);
            }
            "6" => {
                drop(current_state);
                let mut state_mut = state.lock().await;
                show_reminder(&mut state_mut).await;
                continue;
            }
            "7" => {
                current_state.drinks_count += 1;
                current_state.time_left = current_state.interval_minutes;
                current_state.is_snoozed = false;
                println!("{}✓ Water intake recorded!{}", GREEN + BOLD, RESET);
            }
            "8" => {
                current_state.time_left = 5;
                current_state.is_snoozed = true;
                println!("{}⏱ Snoozed for 5 minutes{}", YELLOW + BOLD, RESET);
            }
            "0" => {
                current_state.timer_running = false;
                drop(current_state);
                println!("\n{}👋 Stay hydrated! Goodbye!{}\n", BOLD + CYAN, RESET);
                break;
            }
            _ => {
                println!("{}✗ Invalid choice. Please try again.{}", BOLD, RESET);
            }
        }

        drop(current_state);
        sleep(Duration::from_secs(1)).await;
    }

    // Cancel timer task
    let mut final_state = state.lock().await;
    final_state.timer_running = false;
}