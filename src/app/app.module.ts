import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';

import { TextFieldModule } from "@angular/cdk/text-field";
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FileImportComponent } from './components/file-import/file-import.component';
import { NgVar } from "./directives/ngVar.directive";
import { EnchantingCostComponent } from './pages/enchanting-cost/enchanting-cost.component';
import { ExperienceComponent } from './pages/experience/experience.component';
import { FileEditorComponent } from './pages/file-editor/file-editor.component';
import { HomeComponent } from './pages/home/home.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        EnchantingCostComponent,
        ExperienceComponent,
        FileEditorComponent,
        FileImportComponent,
        NgVar
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        TextFieldModule,
        FormsModule,
        BrowserAnimationsModule,
        MatInputModule,
        MatButtonModule,
        MatFormFieldModule,
        CommonModule,
        MatSliderModule,
        MatSnackBarModule,
        HttpClientModule,
        MatProgressSpinnerModule
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }
