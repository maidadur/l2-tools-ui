import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EnchantingCostComponent } from './pages/enchanting-cost/enchanting-cost.component';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './pages/home/home.component';
import { ExperienceComponent } from './pages/experience/experience.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@NgModule({
	declarations: [AppComponent, HomeComponent, EnchantingCostComponent, ExperienceComponent],
	imports: [
		BrowserModule,
		AppRoutingModule,
		FormsModule,
		BrowserAnimationsModule,
		MatInputModule,
		MatFormFieldModule,
		CommonModule,
		MatSliderModule,
		MatSnackBarModule,
		HttpClientModule,
	],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
