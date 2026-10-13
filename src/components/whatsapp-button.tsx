'use client';
import {usePathname} from 'next/navigation';
export default function WhatsAppButton(){
 const pathname=usePathname();
 if(pathname.startsWith('/admin'))return null;
 return <a className="floating-whatsapp" href="https://wa.me/237693049990" target="_blank" rel="noopener noreferrer" aria-label="Chat with Chap Nic Pictures on WhatsApp"><svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M16 .8A15 15 0 0 0 3 23.3L.9 31l7.9-2.1A15.2 15.2 0 1 0 16 .8Zm0 27.6a12.4 12.4 0 0 1-6.3-1.7l-.5-.3-4.7 1.3 1.3-4.6-.3-.5A12.5 12.5 0 1 1 16 28.4Zm6.9-9.3c-.4-.2-2.2-1.1-2.6-1.2-.3-.1-.6-.2-.8.2-.3.4-1 1.2-1.2 1.5-.2.2-.4.3-.8.1-.4-.2-1.6-.6-3-1.9-1.1-.9-1.9-2.1-2.1-2.5-.2-.4 0-.6.2-.8l.6-.7.4-.6c.1-.2 0-.5 0-.7l-1.2-2.8c-.3-.7-.6-.6-.8-.6h-.7c-.3 0-.7.1-1 .5-.4.4-1.3 1.3-1.3 3.1s1.3 3.6 1.5 3.8c.2.3 2.6 4 6.3 5.6.9.4 1.6.6 2.1.7.9.3 1.7.2 2.3.1.7-.1 2.2-.9 2.5-1.8.3-.9.3-1.7.2-1.8-.1-.2-.4-.3-.8-.5Z"/></svg><span>Chat on WhatsApp</span></a>;
}
