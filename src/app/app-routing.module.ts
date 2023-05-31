import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnchantingCostComponent } from './pages/enchanting-cost/enchanting-cost.component';
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'enchanting-cost', component: EnchantingCostComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
