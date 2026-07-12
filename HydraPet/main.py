import sys
import time
import threading
from PySide6.QtWidgets import (
    QApplication, QWidget, QLabel, QPushButton,
    QVBoxLayout, QHBoxLayout, QComboBox
)
from PySide6.QtGui import QPixmap
from PySide6.QtCore import Qt, QTimer


REMINDER_TIME = 60 * 60   # 1 hour


class HydraPet(QWidget):

    def __init__(self):
        super().__init__()

        self.setWindowFlags(
            Qt.FramelessWindowHint |
            Qt.WindowStaysOnTopHint |
            Qt.Tool
        )

        self.setAttribute(Qt.WA_TranslucentBackground)

        self.resize(250, 250)

        self.pet = QLabel(self)

        pixmap = QPixmap("pet.png")
        self.pet.setPixmap(
            pixmap.scaled(
                100,
                100,
                Qt.KeepAspectRatio
            )
        )

        self.message = QLabel(
            "Hi! 💧\nTime to drink water!"
        )

        self.drink = QPushButton("Drink 💙")
        self.snooze = QPushButton("Snooze 😴")

        self.time_box = QComboBox()
        self.time_box.addItems(
            [
                "10 minutes",
                "20 minutes",
                "1 hour"
            ]
        )

        buttons = QHBoxLayout()
        buttons.addWidget(self.drink)
        buttons.addWidget(self.snooze)


        layout = QVBoxLayout()

        layout.addWidget(self.pet)
        layout.addWidget(self.message)
        layout.addLayout(buttons)
        layout.addWidget(self.time_box)

        self.setLayout(layout)


        self.drink.clicked.connect(
            self.drink_water
        )

        self.snooze.clicked.connect(
            self.snooze_pet
        )


    def show_pet(self):

        screen = QApplication.primaryScreen()

        size = screen.availableGeometry()

        start_x = size.width()

        y = size.height() - 300

        self.move(start_x, y)

        self.show()


        # walking animation
        for x in range(
            start_x,
            size.width()-300,
            -5
        ):
            self.move(x, y)
            QApplication.processEvents()
            time.sleep(0.01)



    def drink_water(self):

        self.message.setText(
            "Yay! 💙\nHydration +1"
        )

        QTimer.singleShot(
            3000,
            self.hide
        )



    def snooze_pet(self):

        choice = self.time_box.currentText()

        if choice.startswith("10"):
            delay = 600

        elif choice.startswith("20"):
            delay = 1200

        else:
            delay = 3600


        self.hide()

        threading.Timer(
            delay,
            self.show_pet
        ).start()



def reminder_loop(pet):

    while True:

        time.sleep(
            REMINDER_TIME
        )

        pet.show_pet()



app = QApplication(sys.argv)


pet = HydraPet()


threading.Thread(
    target=reminder_loop,
    args=(pet,),
    daemon=True
).start()


sys.exit(
    app.exec()
)