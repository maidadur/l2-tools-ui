import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnchantingCostComponent as EnchantingPriceComponent } from './pages/enchanting-cost/enchanting-cost.component';
import { ExperienceComponent } from './pages/experience/experience.component';
import { FileEditorComponent } from "./pages/file-editor/file-editor.component";
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'enchanting-price', component: EnchantingPriceComponent },
    { path: 'experience-table', component: ExperienceComponent },
    { path: 'file-editor', component: FileEditorComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
