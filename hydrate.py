#!/usr/bin/env python3
"""
Hydration Buddy - Reminds you to drink water while coding
A cute emoji character walks up your screen to remind you to stay hydrated!
"""

import tkinter as tk
from tkinter import ttk
import threading
import time
from datetime import datetime

class HydrationBuddy:
    def __init__(self, root):
        self.root = root
        self.root.withdraw()
        
   
        self.interval_minutes = 30
        self.drinks_count = 0
        self.time_left = self.interval_minutes
        self.is_snoozed = False
        self.timer_running = False
        
        # Emoji character variants for walking animation
        self.walking_frames = ['🚶', '🧘', '🏃', '🧘']
        self.frame_index = 0
        
        self.setup_main_window()
        self.start_timer()
        
    def setup_main_window(self):
        """Setup the control panel window"""
        self.root.title("Hydration Buddy Control Panel")
        self.root.geometry("500x400")
        self.root.configure(bg='#f0f0f0')
        
  
        self.root.attributes('-topmost', True)
        

        header = tk.Frame(self.root, bg='#667eea', height=80)
        header.pack(fill=tk.X)
        
        title = tk.Label(
            header,
            text="💧 Hydration Buddy",
            font=("Helvetica", 28, "bold"),
            bg='#667eea',
            fg='white'
        )
        title.pack(pady=20)
        
        subtitle = tk.Label(
            header,
            text="Stay hydrated while you code",
            font=("Helvetica", 12),
            bg='#667eea',
            fg='#e0e0ff'
        )
        subtitle.pack()
        
        # Content frame
        content = tk.Frame(self.root, bg='#f0f0f0')
        content.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Interval selection
        interval_label = tk.Label(
            content,
            text="Reminder Interval",
            font=("Helvetica", 11, "bold"),
            bg='#f0f0f0',
            fg='#666'
        )
        interval_label.pack(anchor=tk.W, pady=(0, 10))
        
        button_frame = tk.Frame(content, bg='#f0f0f0')
        button_frame.pack(fill=tk.X, pady=(0, 20))
        
        for minutes in [15, 20, 30, 45, 60]:
            btn = tk.Button(
                button_frame,
                text=f"{minutes}m",
                font=("Helvetica", 10, "bold"),
                bg='white' if minutes != 30 else '#667eea',
                fg='#333' if minutes != 30 else 'white',
                relief=tk.FLAT,
                width=6,
                command=lambda m=minutes: self.set_interval(m)
            )
            btn.pack(side=tk.LEFT, padx=5)
            
            #  reference for updating active state
            if minutes == 30:
                self.active_btn = btn
            setattr(self, f'btn_{minutes}', btn)
        
        # Stats
        stats_frame = tk.Frame(content, bg='#f0f0f0')
        stats_frame.pack(fill=tk.X, pady=20)
        
        # Time left card
        time_card = tk.Frame(stats_frame, bg='white', relief=tk.FLAT, bd=1)
        time_card.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 10))
        
        tk.Label(time_card, text="Next drink in", font=("Helvetica", 10), bg='white', fg='#999').pack(pady=(10, 5))
        self.time_left_label = tk.Label(time_card, text="30", font=("Helvetica", 32, "bold"), bg='white', fg='#667eea')
        self.time_left_label.pack()
        tk.Label(time_card, text="minutes", font=("Helvetica", 10), bg='white', fg='#999').pack(pady=(0, 10))
        
        # Drinks count card
        drinks_card = tk.Frame(stats_frame, bg='white', relief=tk.FLAT, bd=1)
        drinks_card.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=(10, 0))
        
        tk.Label(drinks_card, text="Times hydrated", font=("Helvetica", 10), bg='white', fg='#999').pack(pady=(10, 5))
        self.drinks_label = tk.Label(drinks_card, text="0", font=("Helvetica", 32, "bold"), bg='white', fg='#26d0ce')
        self.drinks_label.pack()
        tk.Label(drinks_card, text="today", font=("Helvetica", 10), bg='white', fg='#999').pack(pady=(0, 10))
        
        # Test button
        test_btn = tk.Button(
            content,
            text="🧪 Test Reminder (Click here)",
            font=("Helvetica", 12, "bold"),
            bg='#667eea',
            fg='white',
            relief=tk.FLAT,
            pady=12,
            command=self.show_reminder
        )
        test_btn.pack(fill=tk.X, pady=10)
        
        # Timer status
        self.timer_label = tk.Label(
            content,
            text="⏱ Timer active - reminder in 30 minutes",
            font=("Helvetica", 10),
            bg='#f0f0f0',
            fg='#666'
        )
        self.timer_label.pack(pady=10)
    
    def set_interval(self, minutes):
        """Set the reminder interval"""
        self.interval_minutes = minutes
        self.time_left = minutes
        self.is_snoozed = False
        
        # Update button colors
        for m in [15, 20, 30, 45, 60]:
            btn = getattr(self, f'btn_{minutes}' if m == minutes else f'btn_{m}')
            if m == minutes:
                btn.config(bg='#667eea', fg='white')
                self.active_btn = btn
            else:
                btn.config(bg='white', fg='#333')
        
        self.update_display()
    
    def start_timer(self):
        """Start the background timer thread"""
        self.timer_running = True
        timer_thread = threading.Thread(target=self.timer_loop, daemon=True)
        timer_thread.start()
    
    def timer_loop(self):
        """Background timer loop"""
        while self.timer_running:
            time.sleep(60)  # Wait 1 minute
            
            self.time_left -= 1
            
            if self.time_left <= 0:
                self.show_reminder()
                self.time_left = self.interval_minutes
            
            self.root.after(0, self.update_display)
    
    def show_reminder(self):
        """Show the walking emoji reminder"""
        reminder_window = tk.Toplevel(self.root)
        reminder_window.withdraw()  # Hide until positioned
        
        # Get screen dimensions
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()
        
        window_width = 450
        window_height = 500
        
        # Start from bottom center
        start_x = (screen_width - window_width) // 2
        start_y = screen_height
        
        reminder_window.geometry(f"{window_width}x{window_height}+{start_x}+{start_y}")
        reminder_window.configure(bg='white')
        reminder_window.attributes('-topmost', True)
        reminder_window.resizable(False, False)
        
        # Remove window decorations for a cleaner look
        reminder_window.attributes('-alpha', 0.0)  # Start invisible
        
        # Title and close behavior
        reminder_window.title("Hydration Time!")
        
        # Content frame
        content_frame = tk.Frame(reminder_window, bg='white')
        content_frame.pack(fill=tk.BOTH, expand=True)
        
        # Emoji character with walking animation
        self.emoji_label = tk.Label(
            content_frame,
            text='🚶',
            font=("Helvetica", 120),
            bg='white'
        )
        self.emoji_label.pack(pady=(30, 10))
        
        # Title
        title = tk.Label(
            content_frame,
            text="Time to hydrate!",
            font=("Helvetica", 24, "bold"),
            bg='white',
            fg='#1a1a1a'
        )
        title.pack(pady=10)
        
        # Message
        message = tk.Label(
            content_frame,
            text="Your brain works better when you're hydrated.\nTake a sip of water and keep coding! 🚀",
            font=("Helvetica", 13),
            bg='white',
            fg='#666',
            justify=tk.CENTER
        )
        message.pack(pady=20, padx=20)
        
        # Button frame
        button_frame = tk.Frame(content_frame, bg='white')
        button_frame.pack(fill=tk.X, padx=20, pady=(20, 30))
        
        # Drink button
        drink_btn = tk.Button(
            button_frame,
            text="✓ Yes, let me drink",
            font=("Helvetica", 12, "bold"),
            bg='#26d0ce',
            fg='white',
            relief=tk.FLAT,
            pady=12,
            command=lambda: self.handle_drink(reminder_window)
        )
        drink_btn.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 8))
        
        # Snooze button
        snooze_btn = tk.Button(
            button_frame,
            text="⏱ Snooze 5m",
            font=("Helvetica", 12, "bold"),
            bg='#f0f0f0',
            fg='#333',
            relief=tk.FLAT,
            pady=12,
            command=lambda: self.handle_snooze(reminder_window)
        )
        snooze_btn.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(8, 0))
        
        # Animate window walking up and fading in
        self.animate_window_up(reminder_window, start_y, screen_height - window_height - 50)
    
    def animate_window_up(self, window, current_y, target_y):
        """Animate the window walking up the screen"""
        if current_y > target_y:
            # Move up
            new_y = max(target_y, current_y - 20)
            
            # Update geometry
            geometry = window.geometry()
            parts = geometry.split('+')
            x = parts[1]
            window.geometry(f"{parts[0]}+{x}+{new_y}")
            
            # Update walking emoji
            self.emoji_label.config(text=self.walking_frames[self.frame_index])
            self.frame_index = (self.frame_index + 1) % len(self.walking_frames)
            
            # Update alpha (fade in)
            current_alpha = float(window.attributes('-alpha'))
            if current_alpha < 1.0:
                window.attributes('-alpha', min(1.0, current_alpha + 0.1))
            
            # Continue animation
            window.after(50, lambda: self.animate_window_up(window, new_y, target_y))
        else:
            # Animation complete, make sure window is visible and fully opaque
            window.attributes('-alpha', 1.0)
    
    def handle_drink(self, window):
        """Handle drink confirmation"""
        self.drinks_count += 1
        self.time_left = self.interval_minutes
        self.is_snoozed = False
        self.update_display()
        window.destroy()
    
    def handle_snooze(self, window):
        """Handle snooze action"""
        self.time_left = 5
        self.is_snoozed = True
        self.update_display()
        window.destroy()
    
    def update_display(self):
        """Update the display labels"""
        self.time_left_label.config(text=str(self.time_left))
        self.drinks_label.config(text=str(self.drinks_count))
        
        if self.is_snoozed:
            self.timer_label.config(text=f"⏱ Snoozed - reminder in {self.time_left} minute{'s' if self.time_left != 1 else ''}")
        else:
            self.timer_label.config(text=f"⏱ Timer active - reminder in {self.time_left} minute{'s' if self.time_left != 1 else ''}")


def main():
    root = tk.Tk()
    app = HydrationBuddy(root)
    root.deiconify()  # Show main window
    root.mainloop()


if __name__ == "__main__":
    main()
