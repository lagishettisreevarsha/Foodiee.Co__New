import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements AfterViewChecked {
  isTyping = false;
  userInput = '';
  messages: { text: string; sender: 'user' | 'bot' }[] = [];
  allRecipes: any[] = [];

  @ViewChild('chatEnd') chatEnd!: ElementRef;

  constructor(private http: HttpClient, private router: Router) {
    this.loadRecipes();
  }

  ngAfterViewChecked() {
    if (this.chatEnd) {
      this.chatEnd.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  
  loadRecipes() {
    this.http.get<any[]>('http://localhost:3000/foods').subscribe(data => {
      this.allRecipes = data;
    });
  }

  sendMessage() {
    const input = this.userInput.trim();
    if (!input) return;

    this.messages.push({ text: input, sender: 'user' });
    this.userInput = '';
    this.isTyping = true;

    setTimeout(() => {
      if (input.toLowerCase() === 'surprise me') {
        const random = this.allRecipes[Math.floor(Math.random() * this.allRecipes.length)];
        this.messages.push({ text: `🍽️ Surprise recipe: ${random.title}`, sender: 'bot' });
      } else {
        const ingredients = input.toLowerCase().split(',').map(i => i.trim());
        const matched = this.allRecipes.filter(recipe =>
          ingredients.every(ing =>
            recipe.ingredients?.some((ri: string) => ri.toLowerCase().includes(ing))
          )
        );

        if (matched.length) {
          const reply = `Here are some recipes:\n` + matched.map(r => `🍽️ ${r.title}`).join('\n');
          this.messages.push({ text: reply, sender: 'bot' });
        } else {
          this.messages.push({ text: "Sorry, I couldn't find recipes with those ingredients 😔", sender: 'bot' });
        }
      }

      this.isTyping = false;
      this.scrollToBottom();
    }, 1000);
  }

  clearChat() {
    this.messages = [];
    this.userInput = '';
  }

  scrollToBottom() {
    if (this.chatEnd) {
      this.chatEnd.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  goBack() {
    this.router.navigate(['home']);
  }
}
