import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  userName = '';
  nameInput = '';

  ngOnInit() {
    // Check if user already entered their name
    this.userName = localStorage.getItem('userName') || '';
  }

  saveName() {
    if (this.nameInput && this.nameInput.trim().length >= 2) {
      this.userName = this.nameInput.trim();
      localStorage.setItem('userName', this.userName);
    }
  }
}
