#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include <signal.h>
#include <pthread.h>

// ANSI Color codes
#define RESET   "\x1b[0m"
#define BOLD    "\x1b[1m"
#define BLUE    "\x1b[34m"
#define CYAN    "\x1b[36m"
#define GREEN   "\x1b[32m"
#define YELLOW  "\x1b[33m"
#define BG_BLUE "\x1b[44m"
#define BG_CYAN "\x1b[46m"

typedef struct {
    int interval_minutes;
    int time_left;
    int drinks_count;
    int is_snoozed;
    int timer_running;
    int show_menu;
} HydrationState;

// Walking animation frames of the app
const char *walking_frames[] = {"🚶", "🧘", "🏃", "🧘"};
int frame_count = 4;

void clear_screen() {
    system("clear");
}

void print_header() {
    printf("%s%s", BG_BLUE, RESET);
    printf("\n");
    printf("%s    💧 Hydration Buddy - Stay hydrated while you code!%s\n", BOLD BLUE, RESET);
    printf("\n");
}

void print_separator() {
    printf("%s━━━━━━━━━━━━━━━━━━━━%s\n", CYAN, RESET);
}

void print_main_menu(HydrationState *state) {
    clear_screen();
    print_header();
    
    printf("\n%s📊 Current Status:%s\n", BOLD, RESET);
    print_separator();
    
    printf("%s⏱  Time until next reminder:%s %s%d%s minutes\n", 
           BOLD, RESET, BOLD BLUE, state->time_left, RESET);
    printf("%s💧 Times hydrated today:%s %s%d%s\n\n", 
           BOLD, RESET, BOLD GREEN, state->drinks_count, RESET);
    
    if (state->is_snoozed) {
        printf("%s✓ Status:%s Snoozed (reminder in %d minute%s)\n\n", 
               BOLD, RESET, state->time_left, state->time_left != 1 ? "s" : "");
    } else {
        printf("%s✓ Status:%s Timer active (reminder in %d minute%s)\n\n", 
               BOLD, RESET, state->time_left, state->time_left != 1 ? "s" : "");
    }
    
    printf("%s🔔 Reminder Interval:%s\n", BOLD, RESET);
    printf("  ");
    int intervals[] = {15, 20, 30, 45, 60};
    for (int i = 0; i < 5; i++) {
        if (intervals[i] == state->interval_minutes) {
            printf("%s[%d] %s ", BOLD GREEN, intervals[i], RESET);
        } else {
            printf("[%d] ", intervals[i]);
        }
    }
    printf("\n\n");
    
    printf("%s📋 Menu:%s\n", BOLD, RESET);
    print_separator();
    printf("  %s1%s - Set interval to 15 minutes\n", BOLD CYAN, RESET);
    printf("  %s2%s - Set interval to 20 minutes\n", BOLD CYAN, RESET);
    printf("  %s3%s - Set interval to 30 minutes (default)\n", BOLD CYAN, RESET);
    printf("  %s4%s - Set interval to 45 minutes\n", BOLD CYAN, RESET);
    printf("  %s5%s - Set interval to 60 minutes\n", BOLD CYAN, RESET);
    printf("  %s6%s - Show reminder now (test)\n", BOLD CYAN, RESET);
    printf("  %s7%s - Drink water (reset timer)\n", BOLD CYAN, RESET);
    printf("  %s8%s - Snooze for 5 minutes\n", BOLD CYAN, RESET);
    printf("  %s0%s - Exit\n", BOLD CYAN, RESET);
    printf("\n%sEnter your choice: %s", BOLD, RESET);
}

void show_reminder(HydrationState *state) {
    clear_screen();
    print_header();
    
    printf("\n");
    printf("%s%s%s%s%s\n", BOLD, "                        ", walking_frames[0], RESET, "\n");
    printf("\n");
    printf("%s%s💧 Time to hydrate! 💧%s\n\n", BOLD BLUE, "                    ", RESET);
    printf("%s%s%s\n", CYAN, "    Your brain works better when you're hydrated.", RESET);
    printf("%s%s%s\n", CYAN, "    Take a sip of water and keep coding! 🚀", RESET);
    printf("\n");
    print_separator();
    printf("\n%s1%s - Yes, I drank water ✓\n", BOLD GREEN, RESET);
    printf("%s2%s - Snooze for 5 minutes ⏱\n", BOLD YELLOW, RESET);
    printf("\nEnter your choice: ");
}

void handle_reminder(HydrationState *state) {
    int choice;
    show_reminder(state);
    scanf("%d", &choice);
    
    if (choice == 1) {
        state->drinks_count++;
        state->time_left = state->interval_minutes;
        state->is_snoozed = 0;
        printf("\n%s✓ Great! Keep up the hydration!%s\n", GREEN BOLD, RESET);
        sleep(2);
    } else if (choice == 2) {
        state->time_left = 5;
        state->is_snoozed = 1;
        printf("\n%s⏱ Snoozed for 5 minutes. Next reminder soon!%s\n", YELLOW BOLD, RESET);
        sleep(2);
    }
}

void set_interval(HydrationState *state, int minutes) {
    state->interval_minutes = minutes;
    state->time_left = minutes;
    state->is_snoozed = 0;
    printf("%s✓ Reminder interval set to %d minutes%s\n", GREEN BOLD, minutes, RESET);
    sleep(1);
}

void *timer_thread(void *arg) {
    HydrationState *state = (HydrationState *)arg;
    
    while (state->timer_running) {
        sleep(60);  // 1 minute
        
        if (state->time_left > 0) {
            state->time_left--;
        }
        
        if (state->time_left == 0 && state->timer_running) {
            state->show_menu = 0;  // Signal to show reminder
            handle_reminder(state);
            state->show_menu = 1;  // Resume menu
        }
    }
    
    return NULL;
}

int main() {
    HydrationState state = {
        .interval_minutes = 30,
        .time_left = 30,
        .drinks_count = 0,
        .is_snoozed = 0,
        .timer_running = 1,
        .show_menu = 1
    };
    
    pthread_t timer_tid;
    pthread_create(&timer_tid, NULL, timer_thread, &state);
    
    int choice;
    
    while (state.timer_running) {
        if (state.show_menu) {
            print_main_menu(&state);
        }
        
        if (scanf("%d", &choice) != 1) {
            scanf("%*c");  // Clear invalid input
            continue;
        }
        
        switch (choice) {
            case 1:
                set_interval(&state, 15);
                break;
            case 2:
                set_interval(&state, 20);
                break;
            case 3:
                set_interval(&state, 30);
                break;
            case 4:
                set_interval(&state, 45);
                break;
            case 5:
                set_interval(&state, 60);
                break;
            case 6:
                handle_reminder(&state);
                break;
            case 7:
                state.drinks_count++;
                state.time_left = state.interval_minutes;
                state.is_snoozed = 0;
                printf("%s✓ Water intake recorded!%s\n", GREEN BOLD, RESET);
                sleep(1);
                break;
            case 8:
                state.time_left = 5;
                state.is_snoozed = 1;
                printf("%s⏱ Snoozed for 5 minutes%s\n", YELLOW BOLD, RESET);
                sleep(1);
                break;
            case 0:
                state.timer_running = 0;
                printf("\n%s👋 Stay hydrated! Goodbye!%s\n\n", BOLD CYAN, RESET);
                break;
            default:
                printf("%s✗ Invalid choice. Please try again.%s\n", BOLD, RESET);
                sleep(1);
        }
    }
    
    pthread_join(timer_tid, NULL);
    
    return 0;
}
