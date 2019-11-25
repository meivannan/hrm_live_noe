if(data.emp_status==2) // SINGAPORE PR
{
    var total_contribuation=0;
    var total_contribuation_percent=0;
    var year=data.pr_date;
    var pr_year= moment().diff(year, 'years');
    if(pr_year==1) // SINGAPORE PR 1st year
    {
        if(data.pr_status==1) // Grdauate employee
        {
            if(age<=60)
            {
                if(total_wages <= 50)
                {
                    employee_contribution_amount=0;
                    employer_contribution_amount=0;
                    total_contribuation=employee_contribution_amount+employer_contribution_amount;


                }
                else if(total_wages >50&&total_wages<=500)
                {
                    employer_contribution_percent=4 //percent;
                    employee_contribution_percent=0;
                    employer_contribution_amount=total_wages*(employer_contribution_percent/100);
                    total_contribuation=employer_contribution_amount;

                }
                else if(total_wages >500&&total_wages<=750)
               {
                   employer_contribution_percent=4 //percent;
                   var amount=(total_wages-500);
                   employee_contribution_percent=0.15; // emp_perceent=tw-500;
                   total_contribuation=total_wages*(employer_contribution_percent/100)+ 0.15*(amount);
                   employee_contribution_amount=0.15*(amount);
                   employer_contribution_amount=total_contribuation-employee_contribution_amount;
               }
                else if(total_wages >750)
                {
                    total_contribuation_percent=9;
                    total_contribuation=OW*(total_contribuation_percent/100)+ AW*(total_contribuation_percent/100)
                    
                    if(total_contribuation >= 540)
                    {
                        total_contribuation =540;
                    }
                    employee_contribution_percent=5;
                    employee_contribution_amount=OW*(employee_contribution_percent/100)+ AW*(employee_contribution_percent/100)
                    if(employee_contribution_amount >= 300)
                    {
                        employee_contribution_amount =300;
                    }
                    
                    employer_contribution_amount=total_contribuation-employee_contribution_amount;
                }
            }
            
            else if(age>60 )
            {
                if(total_wages <= 50)
                {
                    employee_contribution_amount=0;
                    employer_contribution_amount=0;
                    total_contribuation=employee_contribution_amount+employer_contribution_amount;
                }
                else if(total_wages >50&&total_wages<=500)
                {
                    employer_contribution_percent=3.5 //percent;
                    employee_contribution_percent=0;
                    employer_contribution_amount=total_wages*(employer_contribution_percent/100);
                    total_contribuation=employer_contribution_amount;
                }
                else if(total_wages >500&&total_wages<=750)
               {
                   employer_contribution_percent=3.5 //percent;
                   var amount=(total_wages-500);
                   employee_contribution_percent=0.15; // emp_perceent=tw-500;
                   total_contribuation=total_wages*(employer_contribution_percent/100) +0.15*(amount);
                   employee_contribution_amount=0.15*(amount);
                   employer_contribution_amount=total_contribuation-employee_contribution_amount;
               }
                else if(total_wages >750)
                {
                    total_contribuation_percent=8.5;
                    total_contribuation=OW*(total_contribuation_percent/100)+ AW*(total_contribuation_percent/100)
                    
                    if(total_contribuation >= 510)
                    {
                        total_contribuation =510;
                    }
                    employee_contribution_percent=5;
                    employee_contribution_amount=OW*(employee_contribution_percent/100)+ AW*(employee_contribution_percent/100)
                    if(employee_contribution_amount >= 300)
                    {
                        employee_contribution_amount =300;
                    }
                    
                    employer_contribution_amount=total_contribuation-employee_contribution_amount;
                }   
            }
        }

        if(data.pr_status==2) // Full employee
        {
            if(age<=55)
            {
                if(total_wages <= 50)
                {
                    employee_contribution_amount=0;
                    employer_contribution_amount=0;
                    total_contribuation=employee_contribution_amount+employer_contribution_amount;
                }
                else if(total_wages >50&&total_wages<=500)
                {
                    employer_contribution_percent=17 //percent;
                    employee_contribution_percent=0;
                    employer_contribution_amount=total_wages*(employer_contribution_percent/100);
                    total_contribuation=employer_contribution_amount;

                }
                else if(total_wages >500&&total_wages<=750)
               {
                   employer_contribution_percent=17 //percent;
                   var amount=(total_wages-500);
                   employee_contribution_percent=0.15; // emp_perceent=tw-500;
                   total_contribuation=total_wages*(employer_contribution_percent/100) +0.15*(amount);
                   employee_contribution_amount=0.15*(amount);
                   employer_contribution_amount=total_contribuation-employee_contribution_amount;
               }
                else if(total_wages >750)
                {
                    total_contribuation_percent=22;
                    total_contribuation=OW*(total_contribuation_percent/100)+ AW*(total_contribuation_percent/100)
                    
                    if(total_contribuation >= 1320)
                    {
                        total_contribuation =1320;
                    }
                    employee_contribution_percent=5;
                    employee_contribution_amount=OW*(employee_contribution_percent/100)+ AW*(employee_contribution_percent/100)
                    if(employee_contribution_amount >= 300)
                    {
                        employee_contribution_amount =300;
                    }
                    
                    employer_contribution_amount=total_contribuation-employee_contribution_amount;
                }
            }
            
            else if(age>55 && age<=60 )
            {
                if(total_wages <= 50)
                {
                    employee_contribution_amount=0;
                    employer_contribution_amount=0;
                    total_contribuation=employee_contribution_amount+employer_contribution_amount;
                }
                else if(total_wages >50&&total_wages<=500)
                {
                    employer_contribution_percent=13 //percent;
                    employee_contribution_percent=0;
                    employer_contribution_amount=total_wages*(employer_contribution_percent/100);
                    total_contribuation=employer_contribution_amount;
                }
                else if(total_wages >500&&total_wages<=750)
               {
                   employer_contribution_percent=13 //percent;
                   var amount=(total_wages-500);
                   employee_contribution_percent=0.15; // emp_perceent=tw-500;
                   total_contribuation=total_wages*(employer_contribution_percent/100) +0.15*(amount);
                   employee_contribution_amount=0.15*(amount);
                   employer_contribution_amount=total_contribuation-employee_contribution_amount;
               }
                else if(total_wages >750)
                {
                    total_contribuation_percent=18;
                    total_contribuation=OW*(total_contribuation_percent/100)+ AW*(total_contribuation_percent/100)
                    
                    if(total_contribuation >= 1080)
                    {
                        total_contribuation =1080;
                    }
                    employee_contribution_percent=5;
                    employee_contribution_amount=OW*(employee_contribution_percent/100)+ AW*(employee_contribution_percent/100)
                    if(employee_contribution_amount >= 300)
                    {
                        employee_contribution_amount =300;
                    }
                    
                    employer_contribution_amount=total_contribuation-employee_contribution_amount;
                }   
            }

            else if(age>60 && age<=65 )
            {
                if(total_wages <= 50)
                {
                    employee_contribution_amount=0;
                    employer_contribution_amount=0;
                    total_contribuation=employee_contribution_amount+employer_contribution_amount;
                }
                else if(total_wages >50&&total_wages<=500)
                {
                    employer_contribution_percent=9 //percent;
                    employee_contribution_percent=0;
                    employer_contribution_amount=total_wages*(employer_contribution_percent/100);
                    total_contribuation=employer_contribution_amount;
                }
                else if(total_wages >500&&total_wages<=750)
               {
                   employer_contribution_percent=9 //percent;
                   var amount=(total_wages-500);
                   employee_contribution_percent=0.15; // emp_perceent=tw-500;
                   total_contribuation=total_wages*(employer_contribution_percent/100) +0.15*(amount);
                   employee_contribution_amount=0.15*(amount);
                   employer_contribution_amount=total_contribuation-employee_contribution_amount;
               }
                else if(total_wages >750)
                {
                    total_contribuation_percent=14;
                    total_contribuation=OW*(total_contribuation_percent/100)+ AW*(total_contribuation_percent/100)
                    
                    if(total_contribuation >= 840)
                    {
                        total_contribuation =840;
                    }
                    employee_contribution_percent=5;
                    employee_contribution_amount=OW*(employee_contribution_percent/100)+ AW*(employee_contribution_percent/100)
                    if(employee_contribution_amount >= 300)
                    {
                        employee_contribution_amount =300;
                    }
                    
                    employer_contribution_amount=total_contribuation-employee_contribution_amount;
                }   
            }

            else if(age>65)
            {
                if(total_wages <= 50)
                {
                    employee_contribution_amount=0;
                    employer_contribution_amount=0;
                    total_contribuation=employee_contribution_amount+employer_contribution_amount;
                }
                else if(total_wages >50&&total_wages<=500)
                {
                    employer_contribution_percent=7.5 //percent;
                    employee_contribution_percent=0;
                    employer_contribution_amount=total_wages*(employer_contribution_percent/100);
                    total_contribuation=employer_contribution_amount;
                }
                else if(total_wages >500&&total_wages<=750)
               {
                   employer_contribution_percent=7.5 //percent;
                   var amount=(total_wages-500);
                   employee_contribution_percent=0.15; // emp_perceent=tw-500;
                   total_contribuation=total_wages*(employer_contribution_percent/100) +0.15*(amount);
                   employee_contribution_amount=0.15*(amount);
                   employer_contribution_amount=total_contribuation-employee_contribution_amount;
               }
                else if(total_wages >750)
                {
                    total_contribuation_percent=12.5;
                    total_contribuation=OW*(total_contribuation_percent/100)+ AW*(total_contribuation_percent/100)
                    
                    if(total_contribuation >= 750)
                    {
                        total_contribuation =750;
                    }
                    employee_contribution_percent=5;
                    employee_contribution_amount=OW*(employee_contribution_percent/100)+ AW*(employee_contribution_percent/100)
                    if(employee_contribution_amount >= 300)
                    {
                        employee_contribution_amount =300;
                    }
                    
                    employer_contribution_amount=total_contribuation-employee_contribution_amount;
                }   
            }
        }
    }

    if(pr_year==2) // SINGAPORE PR 2nd year
    {
        if(data.pr_status==1) // Grdauate employee
        {
            if(age<=55)
            {
                if(total_wages <= 50)
                {
                    employee_contribution_amount=0;
                    employer_contribution_amount=0;
                    total_contribuation=employee_contribution_amount+employer_contribution_amount;
                }
                else if(total_wages >50&&total_wages<=500)
                {
                    employer_contribution_percent=9 //percent;
                    employee_contribution_percent=0;
                    employer_contribution_amount=total_wages*(employer_contribution_percent/100);
                    total_contribuation=employer_contribution_amount;

                }
                else if(total_wages >500&&total_wages<=750)
               {
                   employer_contribution_percent=9 //percent;
                   var amount=(total_wages-500);
                   employee_contribution_percent=0.45; // emp_perceent=tw-500;
                   total_contribuation=total_wages*(employer_contribution_percent/100) +0.45*(amount);
                   employee_contribution_amount=0.45*(amount);
                   employer_contribution_amount=total_contribuation-employee_contribution_amount;
               }
                else if(total_wages >750)
                {
                    total_contribuation_percent=24;
                    total_contribuation=OW*(total_contribuation_percent/100)+ AW*(total_contribuation_percent/100)
                    
                    if(total_contribuation >= 1440)
                    {
                        total_contribuation =1440;
                    }
                    employee_contribution_percent=15;
                    employee_contribution_amount=OW*(employee_contribution_percent/100)+ AW*(employee_contribution_percent/100)
                    if(employee_contribution_amount >= 900)
                    {
                        employee_contribution_amount =900;
                    }
                    
                    employer_contribution_amount=total_contribuation-employee_contribution_amount;
                }
            }
            
            else if(age>55 && age<=60 )
            {
                if(total_wages <= 50)
                {
                    employee_contribution_amount=0;
                    employer_contribution_amount=0;
                    total_contribuation=employee_contribution_amount+employer_contribution_amount;
                }
                else if(total_wages >50&&total_wages<=500)
                {
                    employer_contribution_percent=6 //percent;
                    employee_contribution_percent=0;
                    employer_contribution_amount=total_wages*(employer_contribution_percent/100);
                    total_contribuation=employer_contribution_amount;
                }
                else if(total_wages >500&&total_wages<=750)
               {
                   employer_contribution_percent=6 //percent;
                   var amount=(total_wages-500);
                   employee_contribution_percent=0.375; // emp_perceent=tw-500;
                   total_contribuation=total_wages*(employer_contribution_percent/100) +0.375*(amount);
                   employee_contribution_amount=0.375*(amount);
                   employer_contribution_amount=total_contribuation-employee_contribution_amount;
               }
                else if(total_wages >750)
                {
                    total_contribuation_percent=18.5;
                    total_contribuation=OW*(total_contribuation_percent/100)+ AW*(total_contribuation_percent/100)
                    
                    if(total_contribuation >= 1110)
                    {
                        total_contribuation =1110;
                    }
                    employee_contribution_percent=12.5;
                    employee_contribution_amount=OW*(employee_contribution_percent/100)+ AW*(employee_contribution_percent/100)
                    if(employee_contribution_amount >= 750)
                    {
                        employee_contribution_amount =750;
                    }
                    
                    employer_contribution_amount=total_contribuation-employee_contribution_amount;
                }   
            }

            else if(age>60 && age<=65 )
            {
                if(total_wages <= 50)
                {
                    employee_contribution_amount=0;
                    employer_contribution_amount=0;
                    total_contribuation=employee_contribution_amount+employer_contribution_amount;
                }
                else if(total_wages >50&&total_wages<=500)
                {
                    employer_contribution_percent=3.5 //percent;
                    employee_contribution_percent=0;
                    employer_contribution_amount=total_wages*(employer_contribution_percent/100);
                    total_contribuation=employer_contribution_amount;
                }
                else if(total_wages >500&&total_wages<=750)
               {
                   employer_contribution_percent=3.5 //percent;
                   var amount=(total_wages-500);
                   employee_contribution_percent=0.225; // emp_perceent=tw-500;
                   total_contribuation=total_wages*(employer_contribution_percent/100) +0.225*(amount);
                   employee_contribution_amount=0.225*(amount);
                   employer_contribution_amount=total_contribuation-employee_contribution_amount;
               }
                else if(total_wages >750)
                {
                    total_contribuation_percent=11;
                    total_contribuation=OW*(total_contribuation_percent/100)+ AW*(total_contribuation_percent/100)
                    
                    if(total_contribuation >= 660)
                    {
                        total_contribuation =660;
                    }
                    employee_contribution_percent=7.5;
                    employee_contribution_amount=OW*(employee_contribution_percent/100)+ AW*(employee_contribution_percent/100)
                    if(employee_contribution_amount >= 450)
                    {
                        employee_contribution_amount =450;
                    }
                    
                    employer_contribution_amount=total_contribuation-employee_contribution_amount;
                }   
            }

            else if(age>65)
            {
                if(total_wages <= 50)
                {
                    employee_contribution_amount=0;
                    employer_contribution_amount=0;
                    total_contribuation=employee_contribution_amount+employer_contribution_amount;
                }
                else if(total_wages >50&&total_wages<=500)
                {
                    employer_contribution_percent=3.5 //percent;
                    employee_contribution_percent=0;
                    employer_contribution_amount=total_wages*(employer_contribution_percent/100);
                    total_contribuation=employer_contribution_amount;
                }
                else if(total_wages >500&&total_wages<=750)
               {
                   employer_contribution_percent=3.5 //percent;
                   var amount=(total_wages-500);
                   employee_contribution_percent=0.15; // emp_perceent=tw-500;
                   total_contribuation=total_wages*(employer_contribution_percent/100) +0.15*(amount);
                   employee_contribution_amount=0.15*(amount);
                   employer_contribution_amount=total_contribuation-employee_contribution_amount;
               }
                else if(total_wages >750)
                {
                    total_contribuation_percent=8.5;
                    total_contribuation=OW*(total_contribuation_percent/100)+ AW*(total_contribuation_percent/100)
                    
                    if(total_contribuation >= 510)
                    {
                        total_contribuation =510;
                    }
                    employee_contribution_percent=5;
                    employee_contribution_amount=OW*(employee_contribution_percent/100)+ AW*(employee_contribution_percent/100)
                    if(employee_contribution_amount >= 300)
                    {
                        employee_contribution_amount =300;
                    }
                    
                    employer_contribution_amount=total_contribuation-employee_contribution_amount;
                }   
            }
        }

        if(data.pr_status==2) // Full employee
        {
            if(age<=55)
            {
                if(total_wages <= 50)
                {
                    employee_contribution_amount=0;
                    employer_contribution_amount=0;
                    total_contribuation=employee_contribution_amount+employer_contribution_amount;
                }
                else if(total_wages >50&&total_wages<=500)
                {
                    employer_contribution_percent=17 //percent;
                    employee_contribution_percent=0;
                    employer_contribution_amount=total_wages*(employer_contribution_percent/100);
                    total_contribuation=employer_contribution_amount;

                }
                else if(total_wages >500&&total_wages<=750)
               {
                   employer_contribution_percent=17 //percent;
                   var amount=(total_wages-500);
                   employee_contribution_percent=0.45; // emp_perceent=tw-500;
                   total_contribuation=total_wages*(employer_contribution_percent/100) +0.45*(amount);
                   employee_contribution_amount=0.45*(amount);
                   employer_contribution_amount=total_contribuation-employee_contribution_amount;
               }
                else if(total_wages >750)
                {
                    total_contribuation_percent=32;
                    total_contribuation=OW*(total_contribuation_percent/100)+ AW*(total_contribuation_percent/100)
                    
                    if(total_contribuation >= 1920)
                    {
                        total_contribuation =1920;
                    }
                    employee_contribution_percent=15;
                    employee_contribution_amount=OW*(employee_contribution_percent/100)+ AW*(employee_contribution_percent/100)
                    if(employee_contribution_amount >= 900)
                    {
                        employee_contribution_amount =900;
                    }
                    
                    employer_contribution_amount=total_contribuation-employee_contribution_amount;
                }
            }
            
            else if(age>55 && age<=60 )
            {
                if(total_wages <= 50)
                {
                    employee_contribution_amount=0;
                    employer_contribution_amount=0;
                    total_contribuation=employee_contribution_amount+employer_contribution_amount;
                }
                else if(total_wages >50&&total_wages<=500)
                {
                    employer_contribution_percent=13 //percent;
                    employee_contribution_percent=0;
                    employer_contribution_amount=total_wages*(employer_contribution_percent/100);
                    total_contribuation=employer_contribution_amount;
                }
                else if(total_wages >500&&total_wages<=750)
               {
                   employer_contribution_percent=13 //percent;
                   var amount=(total_wages-500);
                   employee_contribution_percent=0.375; // emp_perceent=tw-500;
                   total_contribuation=total_wages*(employer_contribution_percent/100) +0.375*(amount);
                   employee_contribution_amount=0.375*(amount);
                   employer_contribution_amount=total_contribuation-employee_contribution_amount;
               }
                else if(total_wages >750)
                {
                    total_contribuation_percent=22.5;
                    total_contribuation=OW*(total_contribuation_percent/100)+ AW*(total_contribuation_percent/100)
                    
                    if(total_contribuation >= 1530)
                    {
                        total_contribuation =1530;
                    }
                    employee_contribution_percent=12.5;
                    employee_contribution_amount=OW*(employee_contribution_percent/100)+ AW*(employee_contribution_percent/100)
                    if(employee_contribution_amount >= 750)
                    {
                        employee_contribution_amount =750;
                    }
                    
                    employer_contribution_amount=total_contribuation-employee_contribution_amount;
                }   
            }

            else if(age>60 && age<=65 )
            {
                if(total_wages <= 50)
                {
                    employee_contribution_amount=0;
                    employer_contribution_amount=0;
                    total_contribuation=employee_contribution_amount+employer_contribution_amount;
                }
                else if(total_wages >50&&total_wages<=500)
                {
                    employer_contribution_percent=9 //percent;
                    employee_contribution_percent=0;
                    employer_contribution_amount=total_wages*(employer_contribution_percent/100);
                    total_contribuation=employer_contribution_amount;
                }
                else if(total_wages >500&&total_wages<=750)
               {
                   employer_contribution_percent=9 //percent;
                   var amount=(total_wages-500);
                   employee_contribution_percent=0.225; // emp_perceent=tw-500;
                   total_contribuation=total_wages*(employer_contribution_percent/100) +0.225*(amount);
                   employee_contribution_amount=0.225*(amount);
                   employer_contribution_amount=total_contribuation-employee_contribution_amount;
               }
                else if(total_wages >750)
                {
                    total_contribuation_percent=16.5;
                    total_contribuation=OW*(total_contribuation_percent/100)+ AW*(total_contribuation_percent/100)
                    
                    if(total_contribuation >= 990)
                    {
                        total_contribuation =990;
                    }
                    employee_contribution_percent=7.5;
                    employee_contribution_amount=OW*(employee_contribution_percent/100)+ AW*(employee_contribution_percent/100)
                    if(employee_contribution_amount >= 450)
                    {
                        employee_contribution_amount =450;
                    }
                    
                    employer_contribution_amount=total_contribuation-employee_contribution_amount;
                }   
            }

            else if(age>65)
            {
                if(total_wages <= 50)
                {
                    employee_contribution_amount=0;
                    employer_contribution_amount=0;
                    total_contribuation=employee_contribution_amount+employer_contribution_amount;
                }
                else if(total_wages >50&&total_wages<=500)
                {
                    employer_contribution_percent=7.5 //percent;
                    employee_contribution_percent=0;
                    employer_contribution_amount=total_wages*(employer_contribution_percent/100);
                    total_contribuation=employer_contribution_amount;
                }
                else if(total_wages >500&&total_wages<=750)
               {
                   employer_contribution_percent=7.5 //percent;
                   var amount=(total_wages-500);
                   employee_contribution_percent=0.15; // emp_perceent=tw-500;
                   total_contribuation=total_wages*(employer_contribution_percent/100) +0.15*(amount);
                   employee_contribution_amount=0.15*(amount);
                   employer_contribution_amount=total_contribuation-employee_contribution_amount;
               }
                else if(total_wages >750)
                {
                    total_contribuation_percent=12.5;
                    total_contribuation=OW*(total_contribuation_percent/100)+ AW*(total_contribuation_percent/100)
                    
                    if(total_contribuation >= 750)
                    {
                        total_contribuation =750;
                    }
                    employee_contribution_percent=5;
                    employee_contribution_amount=OW*(employee_contribution_percent/100)+ AW*(employee_contribution_percent/100)
                    if(employee_contribution_amount >= 300)
                    {
                        employee_contribution_amount =300;
                    }
                    
                    employer_contribution_amount=total_contribuation-employee_contribution_amount;
                }   
            }
        }
    }

    if(pr_year>=3) // SINGAPORE PR 3rd Year Onwards
    {
            if(age<=55)
            {
                if(total_wages <= 50)
                {
                    employee_contribution_amount=0;
                    employer_contribution_amount=0;
                    total_contribuation=employee_contribution_amount+employer_contribution_amount;
                }
                else if(total_wages >50&&total_wages<=500)
                {
                    employer_contribution_percent=17 //percent;
                    employee_contribution_percent=0;
                    employer_contribution_amount=total_wages*(employer_contribution_percent/100);
                    total_contribuation=employer_contribution_amount;

                }
                else if(total_wages >500&&total_wages<=750)
               {
                   employer_contribution_percent=17 //percent;
                   var amount=(total_wages-500);
                   employee_contribution_percent=0.6; // emp_perceent=tw-500;
                   total_contribuation=total_wages*(employer_contribution_percent/100) +0.6*(amount);
                   employee_contribution_amount=0.6*(amount);
                   employer_contribution_amount=total_contribuation-employee_contribution_amount;
               }
                else if(total_wages >750)
                {
                    total_contribuation_percent=37;
                    total_contribuation=OW*(total_contribuation_percent/100)+ AW*(total_contribuation_percent/100)
                    
                    if(total_contribuation >= 2220)
                    {
                        total_contribuation =2220;
                    }
                    employee_contribution_percent=20;
                    employee_contribution_amount=OW*(employee_contribution_percent/100)+ AW*(employee_contribution_percent/100)
                    if(employee_contribution_amount >= 1200)
                    {
                        employee_contribution_amount =1200;
                    }
                    
                    employer_contribution_amount=total_contribuation-employee_contribution_amount;
                }
            }
            
            else if(age>55 && age<=60 )
            {
                if(total_wages <= 50)
                {
                    employee_contribution_amount=0;
                    employer_contribution_amount=0;
                    total_contribuation=employee_contribution_amount+employer_contribution_amount;
                }
                else if(total_wages >50&&total_wages<=500)
                {
                    employer_contribution_percent=13 //percent;
                    employee_contribution_percent=0;
                    employer_contribution_amount=total_wages*(employer_contribution_percent/100);
                    total_contribuation=employer_contribution_amount;
                }
                else if(total_wages >500&&total_wages<=750)
               {
                   employer_contribution_percent=13 //percent;
                   var amount=(total_wages-500);
                   employee_contribution_percent=0.39; // emp_perceent=tw-500;
                   total_contribuation=total_wages*(employer_contribution_percent/100) +0.39*(amount);
                   employee_contribution_amount=0.39*(amount);
                   employer_contribution_amount=total_contribuation-employee_contribution_amount;
               }
                else if(total_wages >750)
                {
                    total_contribuation_percent=26;
                    total_contribuation=OW*(total_contribuation_percent/100)+ AW*(total_contribuation_percent/100)
                    
                    if(total_contribuation >= 1560)
                    {
                        total_contribuation =1560;
                    }
                    employee_contribution_percent=13;
                    employee_contribution_amount=OW*(employee_contribution_percent/100)+ AW*(employee_contribution_percent/100)
                    if(employee_contribution_amount >= 780)
                    {
                        employee_contribution_amount =780;
                    }
                    
                    employer_contribution_amount=total_contribuation-employee_contribution_amount;
                }   
            }

            else if(age>60 && age<=65 )
            {
                if(total_wages <= 50)
                {
                    employee_contribution_amount=0;
                    employer_contribution_amount=0;
                    total_contribuation=employee_contribution_amount+employer_contribution_amount;
                }
                else if(total_wages >50&&total_wages<=500)
                {
                    employer_contribution_percent=9 //percent;
                    employee_contribution_percent=0;
                    employer_contribution_amount=total_wages*(employer_contribution_percent/100);
                    total_contribuation=employer_contribution_amount;
                }
                else if(total_wages >500&&total_wages<=750)
               {
                   employer_contribution_percent=9 //percent;
                   var amount=(total_wages-500);
                   employee_contribution_percent=0.225; // emp_perceent=tw-500;
                   total_contribuation=total_wages*(employer_contribution_percent/100) +0.225*(amount);
                   employee_contribution_amount=0.225*(amount);
                   employer_contribution_amount=total_contribuation-employee_contribution_amount;
               }
                else if(total_wages >750)
                {
                    total_contribuation_percent=16.5;
                    total_contribuation=OW*(total_contribuation_percent/100)+ AW*(total_contribuation_percent/100)
                    
                    if(total_contribuation >= 990)
                    {
                        total_contribuation =990;
                    }
                    employee_contribution_percent=7.5;
                    employee_contribution_amount=OW*(employee_contribution_percent/100)+ AW*(employee_contribution_percent/100)
                    if(employee_contribution_amount >= 450)
                    {
                        employee_contribution_amount =450;
                    }
                    
                    employer_contribution_amount=total_contribuation-employee_contribution_amount;
                }   
            }

            else if(age>65)
            {
                if(total_wages <= 50)
                {
                    employee_contribution_amount=0;
                    employer_contribution_amount=0;
                    total_contribuation=employee_contribution_amount+employer_contribution_amount;
                }
                else if(total_wages >50&&total_wages<=500)
                {
                    employer_contribution_percent=7.5 //percent;
                    employee_contribution_percent=0;
                    employer_contribution_amount=total_wages*(employer_contribution_percent/100);
                    total_contribuation=employer_contribution_amount;
                }
                else if(total_wages >500&&total_wages<=750)
               {
                   employer_contribution_percent=7.5 //percent;
                   var amount=(total_wages-500);
                   employee_contribution_percent=0.15; // emp_perceent=tw-500;
                   total_contribuation=total_wages*(employer_contribution_percent/100) +0.15*(amount);
                   employee_contribution_amount=0.15*(amount);
                   employer_contribution_amount=total_contribuation-employee_contribution_amount;
               }
                else if(total_wages >750)
                {
                    total_contribuation_percent=12.5;
                    total_contribuation=OW*(total_contribuation_percent/100)+ AW*(total_contribuation_percent/100)
                    
                    if(total_contribuation >= 750)
                    {
                        total_contribuation =750;
                    }
                    employee_contribution_percent=5;
                    employee_contribution_amount=OW*(employee_contribution_percent/100)+ AW*(employee_contribution_percent/100)
                    if(employee_contribution_amount >= 300)
                    {
                        employee_contribution_amount =300;
                    }
                    
                    employer_contribution_amount=total_contribuation-employee_contribution_amount;
                }   
            } 
    }
}

if(data.emp_status==1)   //Singapore Citizen
{
    if(age<=55)
    {
        if(total_wages <= 50)
        {
            employee_contribution_amount=0;
            employer_contribution_amount=0;
            total_contribuation=employee_contribution_amount+employer_contribution_amount;
        }
        else if(total_wages >50&&total_wages<=500)
        {
            employer_contribution_percent=17 //percent;
            employee_contribution_percent=0;
            employer_contribution_amount=total_wages*(employer_contribution_percent/100);
            total_contribuation=employer_contribution_amount;

        }
        else if(total_wages >500&&total_wages<=750)
       {
           employer_contribution_percent=17 //percent;
           var amount=(total_wages-500);
           employee_contribution_percent=0.6; // emp_perceent=tw-500;
           total_contribuation=total_wages*(employer_contribution_percent/100) +0.6*(amount);
           employee_contribution_amount=0.6*(amount);
           employer_contribution_amount=total_contribuation-employee_contribution_amount;
       }
        else if(total_wages >750)
        {
            total_contribuation_percent=37;
            total_contribuation=OW*(total_contribuation_percent/100)+ AW*(total_contribuation_percent/100)
            
            if(total_contribuation >= 2220)
            {
                total_contribuation =2220;
            }
            employee_contribution_percent=20;
            employee_contribution_amount=OW*(employee_contribution_percent/100)+ AW*(employee_contribution_percent/100)
            if(employee_contribution_amount >= 1200)
            {
                employee_contribution_amount =1200;
            }
            
            employer_contribution_amount=total_contribuation-employee_contribution_amount;
        }
    }
    
    else if(age>55 && age<=60 )
    {
        if(total_wages <= 50)
        {
            employee_contribution_amount=0;
            employer_contribution_amount=0;
            total_contribuation=employee_contribution_amount+employer_contribution_amount;
        }
        else if(total_wages >50&&total_wages<=500)
        {
            employer_contribution_percent=13 //percent;
            employee_contribution_percent=0;
            employer_contribution_amount=total_wages*(employer_contribution_percent/100);
            total_contribuation=employer_contribution_amount;
        }
        else if(total_wages >500&&total_wages<=750)
       {
           employer_contribution_percent=13 //percent;
           var amount=(total_wages-500);
           employee_contribution_percent=0.39; // emp_perceent=tw-500;
           total_contribuation=total_wages*(employer_contribution_percent/100) +0.39*(amount);
           employee_contribution_amount=0.39*(amount);
           employer_contribution_amount=total_contribuation-employee_contribution_amount;
       }
        else if(total_wages >750)
        {
            total_contribuation_percent=26;
            total_contribuation=OW*(total_contribuation_percent/100)+ AW*(total_contribuation_percent/100)
            
            if(total_contribuation >= 1560)
            {
                total_contribuation =1560;
            }
            employee_contribution_percent=13;
            employee_contribution_amount=OW*(employee_contribution_percent/100)+ AW*(employee_contribution_percent/100)
            if(employee_contribution_amount >= 780)
            {
                employee_contribution_amount =780;
            }
            
            employer_contribution_amount=total_contribuation-employee_contribution_amount;
        }   
    }

    else if(age>60 && age<=65 )
    {
        if(total_wages <= 50)
        {
            employee_contribution_amount=0;
            employer_contribution_amount=0;
            total_contribuation=employee_contribution_amount+employer_contribution_amount;
        }
        else if(total_wages >50&&total_wages<=500)
        {
            employer_contribution_percent=9 //percent;
            employee_contribution_percent=0;
            employer_contribution_amount=total_wages*(employer_contribution_percent/100);
            total_contribuation=employer_contribution_amount;
        }
        else if(total_wages >500&&total_wages<=750)
       {
           employer_contribution_percent=9 //percent;
           var amount=(total_wages-500);
           employee_contribution_percent=0.225; // emp_perceent=tw-500;
           total_contribuation=total_wages*(employer_contribution_percent/100) +0.225*(amount);
           employee_contribution_amount=0.225*(amount);
           employer_contribution_amount=total_contribuation-employee_contribution_amount;
       }
        else if(total_wages >750)
        {
            total_contribuation_percent=16.5;
            total_contribuation=OW*(total_contribuation_percent/100)+ AW*(total_contribuation_percent/100)
            
            if(total_contribuation >= 990)
            {
                total_contribuation =990;
            }
            employee_contribution_percent=7.5;
            employee_contribution_amount=OW*(employee_contribution_percent/100)+ AW*(employee_contribution_percent/100)
            if(employee_contribution_amount >= 450)
            {
                employee_contribution_amount =450;
            }
            
            employer_contribution_amount=total_contribuation-employee_contribution_amount;
        }   
    }

    else if(age>65)
    {
        if(total_wages <= 50)
        {
            employee_contribution_amount=0;
            employer_contribution_amount=0;
            total_contribuation=employee_contribution_amount+employer_contribution_amount;
        }
        else if(total_wages >50&&total_wages<=500)
        {
            employer_contribution_percent=7.5 //percent;
            employee_contribution_percent=0;
            employer_contribution_amount=total_wages*(employer_contribution_percent/100);
            total_contribuation=employer_contribution_amount;
        }
        else if(total_wages >500&&total_wages<=750)
       {
           employer_contribution_percent=7.5 //percent;
           var amount=(total_wages-500);
           employee_contribution_percent=0.15; // emp_perceent=tw-500;
           total_contribuation=total_wages*(employer_contribution_percent/100) +0.15*(amount);
           employee_contribution_amount=0.15*(amount);
           employer_contribution_amount=total_contribuation-employee_contribution_amount;
       }
        else if(total_wages >750)
        {
            total_contribuation_percent=12.5;
            total_contribuation=OW*(total_contribuation_percent/100)+ AW*(total_contribuation_percent/100)
            
            if(total_contribuation >= 750)
            {
                total_contribuation =750;
            }
            employee_contribution_percent=5;
            employee_contribution_amount=OW*(employee_contribution_percent/100)+ AW*(employee_contribution_percent/100)
            if(employee_contribution_amount >= 300)
            {
                employee_contribution_amount =300;
            }
            
            employer_contribution_amount=total_contribuation-employee_contribution_amount;
        }   
    }

}