import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.geom.RoundRectangle2D;

public class HydrationBuddy extends JFrame {
    private int intervalMinutes = 30;
    private int drinksCount = 0;
    private int timeLeft = 30;
    private boolean isSnoozed = false;
    private boolean timerRunning = false;

    private JLabel timeLeftLabel;
    private JLabel drinksLabel;
    private JLabel timerStatusLabel;
    private JButton activeIntervalBtn;

    private String[] walkingFrames = {"🚶", "🧘", "🏃", "🧘"};
    private int frameIndex = 0;

    public HydrationBuddy() {
        setTitle("Hydration Buddy Control Panel");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(500, 400);
        setLocationRelativeTo(null);
        setAlwaysOnTop(true);
        setResizable(false);

        // Main panel
        JPanel mainPanel = new JPanel();
        mainPanel.setLayout(new BorderLayout());
        mainPanel.setBackground(new Color(240, 240, 240));

        // Header
        JPanel header = createHeader();
        mainPanel.add(header, BorderLayout.NORTH);

        // Content
        JPanel content = createContent();
        JScrollPane scrollPane = new JScrollPane(content);
        scrollPane.setBorder(BorderFactory.createEmptyBorder());
        scrollPane.getViewport().setBackground(new Color(240, 240, 240));
        mainPanel.add(scrollPane, BorderLayout.CENTER);

        setContentPane(mainPanel);
        startTimer();
        setVisible(true);
    }

    private JPanel createHeader() {
        JPanel header = new JPanel();
        header.setLayout(new BoxLayout(header, BoxLayout.Y_AXIS));
        header.setBackground(new Color(102, 126, 234));
        header.setBorder(new EmptyBorder(20, 20, 20, 20));

        JLabel title = new JLabel("💧 Hydration Buddy");
        title.setFont(new Font("Helvetica", Font.BOLD, 28));
        title.setForeground(Color.WHITE);
        title.setAlignmentX(Component.CENTER_ALIGNMENT);

        JLabel subtitle = new JLabel("Stay hydrated while you code");
        subtitle.setFont(new Font("Helvetica", Font.PLAIN, 12));
        subtitle.setForeground(new Color(224, 224, 255));
        subtitle.setAlignmentX(Component.CENTER_ALIGNMENT);

        header.add(title);
        header.add(Box.createVerticalStrut(5));
        header.add(subtitle);

        return header;
    }

    private JPanel createContent() {
        JPanel content = new JPanel();
        content.setLayout(new BoxLayout(content, BoxLayout.Y_AXIS));
        content.setBackground(new Color(240, 240, 240));
        content.setBorder(new EmptyBorder(20, 20, 20, 20));

        // Interval selection
        JLabel intervalLabel = new JLabel("Reminder Interval");
        intervalLabel.setFont(new Font("Helvetica", Font.BOLD, 11));
        intervalLabel.setForeground(new Color(102, 102, 102));
        intervalLabel.setAlignmentX(Component.LEFT_ALIGNMENT);

        JPanel buttonFrame = new JPanel();
        buttonFrame.setLayout(new FlowLayout(FlowLayout.LEFT));
        buttonFrame.setBackground(new Color(240, 240, 240));

        int[] intervals = {15, 20, 30, 45, 60};
        for (int minutes : intervals) {
            JButton btn = createIntervalButton(minutes);
            buttonFrame.add(btn);

            if (minutes == 30) {
                activeIntervalBtn = btn;
            }
        }

        // Stats cards
        JPanel statsFrame = new JPanel();
        statsFrame.setLayout(new GridLayout(1, 2, 10, 0));
        statsFrame.setBackground(new Color(240, 240, 240));

        JPanel timeCard = createStatCard("Next drink in", "30", "minutes", new Color(102, 126, 234));
        timeLeftLabel = (JLabel) ((JPanel) timeCard.getComponent(1)).getComponent(0);

        JPanel drinksCard = createStatCard("Times hydrated", "0", "today", new Color(38, 208, 206));
        drinksLabel = (JLabel) ((JPanel) drinksCard.getComponent(1)).getComponent(0);

        statsFrame.add(timeCard);
        statsFrame.add(drinksCard);

        // Test button
        JButton testBtn = new JButton("🧪 Test Reminder (Click here)");
        testBtn.setFont(new Font("Helvetica", Font.BOLD, 12));
        testBtn.setBackground(new Color(102, 126, 234));
        testBtn.setForeground(Color.WHITE);
        testBtn.setBorder(BorderFactory.createEmptyBorder(12, 20, 12, 20));
        testBtn.setFocusPainted(false);
        testBtn.setMaximumSize(new Dimension(Integer.MAX_VALUE, 50));
        testBtn.addActionListener(e -> showReminder());

        // Timer status
        timerStatusLabel = new JLabel("⏱ Timer active - reminder in 30 minutes");
        timerStatusLabel.setFont(new Font("Helvetica", Font.PLAIN, 10));
        timerStatusLabel.setForeground(new Color(102, 102, 102));
        timerStatusLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

        // Add components to content
        content.add(intervalLabel);
        content.add(Box.createVerticalStrut(8));
        content.add(buttonFrame);
        content.add(Box.createVerticalStrut(20));
        content.add(statsFrame);
        content.add(Box.createVerticalStrut(20));
        content.add(testBtn);
        content.add(Box.createVerticalStrut(10));
        content.add(timerStatusLabel);

        return content;
    }

    private JButton createIntervalButton(int minutes) {
        JButton btn = new JButton(minutes + "m");
        btn.setFont(new Font("Helvetica", Font.BOLD, 10));
        btn.setBackground(minutes == 30 ? new Color(102, 126, 234) : Color.WHITE);
        btn.setForeground(minutes == 30 ? Color.WHITE : new Color(51, 51, 51));
        btn.setBorder(BorderFactory.createEmptyBorder(8, 16, 8, 16));
        btn.setFocusPainted(false);
        btn.setPreferredSize(new Dimension(70, 35));

        btn.addActionListener(e -> setInterval(minutes));

        return btn;
    }

    private JPanel createStatCard(String label, String value, String unit, Color accentColor) {
        JPanel card = new JPanel();
        card.setLayout(new BorderLayout());
        card.setBackground(new Color(249, 249, 249));
        card.setBorder(BorderFactory.createLineBorder(new Color(224, 224, 224)));

        JPanel content = new JPanel();
        content.setLayout(new BoxLayout(content, BoxLayout.Y_AXIS));
        content.setBackground(new Color(249, 249, 249));
        content.setBorder(new EmptyBorder(10, 10, 10, 10));

        JLabel labelText = new JLabel(label);
        labelText.setFont(new Font("Helvetica", Font.PLAIN, 10));
        labelText.setForeground(new Color(153, 153, 153));
        labelText.setAlignmentX(Component.CENTER_ALIGNMENT);

        JLabel valueText = new JLabel(value);
        valueText.setFont(new Font("Helvetica", Font.BOLD, 32));
        valueText.setForeground(accentColor);
        valueText.setAlignmentX(Component.CENTER_ALIGNMENT);

        JLabel unitText = new JLabel(unit);
        unitText.setFont(new Font("Helvetica", Font.PLAIN, 10));
        unitText.setForeground(new Color(153, 153, 153));
        unitText.setAlignmentX(Component.CENTER_ALIGNMENT);

        content.add(labelText);
        content.add(Box.createVerticalStrut(5));
        content.add(valueText);
        content.add(Box.createVerticalStrut(4));
        content.add(unitText);

        card.add(content, BorderLayout.CENTER);
        return card;
    }

    private void setInterval(int minutes) {
        intervalMinutes = minutes;
        timeLeft = minutes;
        isSnoozed = false;

        // Update button colors
        for (Component comp : ((JPanel) ((JScrollPane) getContentPane()
                .getComponent(1)).getViewport().getComponent(0)).getComponents()) {
            // Would need to track buttons to update them
        }

        updateDisplay();
    }

    private void startTimer() {
        timerRunning = true;
        new Thread(() -> {
            while (timerRunning) {
                try {
                    Thread.sleep(60000); // 1 minute
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }

                timeLeft--;

                if (timeLeft <= 0) {
                    showReminder();
                    timeLeft = intervalMinutes;
                }

                SwingUtilities.invokeLater(this::updateDisplay);
            }
        }).start();
    }

    private void updateDisplay() {
        timeLeftLabel.setText(String.valueOf(timeLeft));
        drinksLabel.setText(String.valueOf(drinksCount));

        String status;
        if (isSnoozed) {
            status = String.format("⏱ Snoozed - reminder in %d minute%s", timeLeft, timeLeft != 1 ? "s" : "");
        } else {
            status = String.format("⏱ Timer active - reminder in %d minute%s", timeLeft, timeLeft != 1 ? "s" : "");
        }
        timerStatusLabel.setText(status);
    }

    private void showReminder() {
        SwingUtilities.invokeLater(() -> {
            JWindow reminderWindow = new JWindow();
            reminderWindow.setAlwaysOnTop(true);

            JPanel contentPanel = new JPanel();
            contentPanel.setLayout(new BoxLayout(contentPanel, BoxLayout.Y_AXIS));
            contentPanel.setBackground(Color.WHITE);
            contentPanel.setBorder(new EmptyBorder(30, 20, 30, 20));

            // Emoji label
            JLabel emojiLabel = new JLabel(walkingFrames[0]);
            emojiLabel.setFont(new Font("Dialog", Font.PLAIN, 100));
            emojiLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

            // Title
            JLabel titleLabel = new JLabel("Time to hydrate!");
            titleLabel.setFont(new Font("Helvetica", Font.BOLD, 24));
            titleLabel.setForeground(new Color(26, 26, 26));
            titleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

            // Message
            JLabel messageLabel = new JLabel("<html><center>Your brain works better when you're hydrated.<br>Take a sip of water and keep coding! 🚀</center></html>");
            messageLabel.setFont(new Font("Helvetica", Font.PLAIN, 13));
            messageLabel.setForeground(new Color(102, 102, 102));
            messageLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

            // Button panel
            JPanel buttonPanel = new JPanel();
            buttonPanel.setLayout(new GridLayout(1, 2, 8, 0));
            buttonPanel.setBackground(Color.WHITE);

            JButton drinkBtn = new JButton("✓ Yes, let me drink");
            drinkBtn.setFont(new Font("Helvetica", Font.BOLD, 12));
            drinkBtn.setBackground(new Color(38, 208, 206));
            drinkBtn.setForeground(Color.WHITE);
            drinkBtn.setFocusPainted(false);
            drinkBtn.setPadding(new Insets(12, 20, 12, 20));
            drinkBtn.addActionListener(e -> {
                handleDrink();
                reminderWindow.dispose();
            });

            JButton snoozeBtn = new JButton("⏱ Snooze 5m");
            snoozeBtn.setFont(new Font("Helvetica", Font.BOLD, 12));
            snoozeBtn.setBackground(new Color(240, 240, 240));
            snoozeBtn.setForeground(new Color(51, 51, 51));
            snoozeBtn.setFocusPainted(false);
            snoozeBtn.setPadding(new Insets(12, 20, 12, 20));
            snoozeBtn.addActionListener(e -> {
                handleSnooze();
                reminderWindow.dispose();
            });

            buttonPanel.add(drinkBtn);
            buttonPanel.add(snoozeBtn);

            // Add components
            contentPanel.add(emojiLabel);
            contentPanel.add(Box.createVerticalStrut(10));
            contentPanel.add(titleLabel);
            contentPanel.add(Box.createVerticalStrut(10));
            contentPanel.add(messageLabel);
            contentPanel.add(Box.createVerticalStrut(20));
            contentPanel.add(buttonPanel);

            reminderWindow.setContentPane(contentPanel);
            reminderWindow.setSize(450, 500);

            // Center on screen
            Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize();
            reminderWindow.setLocation(
                    (screenSize.width - 450) / 2,
                    (screenSize.height - 500) / 2
            );

            // Animation
            animateWindow(reminderWindow);

            reminderWindow.setVisible(true);
        });
    }

    private void animateWindow(JWindow window) {
        new Thread(() -> {
            int startY = window.getY();
            int targetY = window.getY();

            for (int i = 0; i < 20; i++) {
                try {
                    Thread.sleep(50);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }

                frameIndex = (frameIndex + 1) % walkingFrames.length;
                final int currentFrameIndex = frameIndex;

                // Update emoji in the window
                SwingUtilities.invokeLater(() -> {
                    // Would need to keep reference to emoji label
                });

                window.repaint();
            }
        }).start();
    }

    private void handleDrink() {
        drinksCount++;
        timeLeft = intervalMinutes;
        isSnoozed = false;
        updateDisplay();
    }

    private void handleSnooze() {
        timeLeft = 5;
        isSnoozed = true;
        updateDisplay();
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(HydrationBuddy::new);
    }
}