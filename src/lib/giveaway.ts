export function giveawayMonth(date=new Date()){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Lagos',year:'numeric',month:'2-digit'}).formatToParts(date);return parts.find(p=>p.type==='year')!.value+'-'+parts.find(p=>p.type==='month')!.value;}
export function validateEntry(data:unknown){
 if(!data||typeof data!=='object')throw Error('Please complete the entry form.');
 const d=data as Record<string,unknown>;
 const field=(key:string,min:number,max:number)=>{const v=d[key];if(typeof v!=='string'||v.trim().length<min||v.trim().length>max)throw Error('Please check '+key+' ('+min+'–'+max+' characters).');return v.trim();};
 const name=field('name',2,100),partner=field('partner',2,100),email=field('email',5,180).toLowerCase(),phone=field('phone',7,30),city=field('city',2,150),venue=field('venue',2,200),date=field('date',10,10),story=field('story',30,6000),location=field('location',2,300);
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Enter a valid email.');
 if(!/^\+?[\d\s().-]{7,30}$/.test(phone))throw Error('Enter a valid phone number with country code.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date||date<new Date().toISOString().slice(0,10))throw Error('Enter a valid upcoming wedding date.');
 if(d.consent!==true||d.website)throw Error('Please confirm permission to contact you about your entry.');
 return {name,partner,email,phone,city,venue,date,story,location,consent:true};
}