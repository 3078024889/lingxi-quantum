export type MealNutrition={kcal?:number|null;protein_g?:number|null;carbs_g?:number|null;fat_g?:number|null;fiber_g?:number|null;sugar_g?:number|null;sodium_mg?:number|null};
export type MealInsight={tone:"balanced"|"protein"|"fiber"|"energy";summaryKey:string;nextMealKey:string};
export function mealInsight(n:MealNutrition):MealInsight{
 const kcal=Number(n.kcal||0),p=Number(n.protein_g||0),c=Number(n.carbs_g||0),f=Number(n.fat_g||0),fiber=Number(n.fiber_g||0);
 if(n.protein_g!=null&&kcal>0&&p*4/kcal<.15)return{tone:"protein",summaryKey:"proteinLight",nextMealKey:"nextProtein"};
 if(n.fiber_g!=null&&kcal>0&&fiber<Math.max(2,kcal/250))return{tone:"fiber",summaryKey:"fiberLight",nextMealKey:"nextFiber"};
 if(n.carbs_g!=null&&kcal>0&&c*4/kcal>.65)return{tone:"energy",summaryKey:"carbHeavy",nextMealKey:"nextVariety"};
 return{tone:"balanced",summaryKey:"recorded",nextMealKey:"nextVariety"};
}
