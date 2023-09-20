import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnchantingCostComponent as EnchantingPriceComponent } from './pages/enchanting-cost/enchanting-cost.component';
import { HomeComponent } from './pages/home/home.component';
import { ExperienceComponent } from './pages/experience/experience.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'enchanting-price', component: EnchantingPriceComponent },
  { path: 'experience-table', component: ExperienceComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
