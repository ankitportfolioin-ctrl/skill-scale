import { NextRequest, NextResponse } from 'next/server'
import { razorpay } from '@/lib/razorpay'
import { EBOOKS_CATALOG } from '@/lib/ebooks-data'
import { requireUser } from '@/lib/supabase-server'
export async function POST(req: NextRequest) {
  try {
    const { client, user } = await requireUser(req)
    if (!user) return NextResponse.json({ error:'You must be signed in to check out.' }, { status:401 })
    const body=await req.json(); const lines=Array.isArray(body?.lines)?body.lines:[]; if(!lines.length)return NextResponse.json({error:'Your cart is empty.'},{status:400})
    let totalPaise=0; const items=[] as {title:string;quantity:number;price:number}[]; const ids:string[]=[]
    for(const line of lines){const book=EBOOKS_CATALOG.find(b=>b.id===line.id);if(!book)return NextResponse.json({error:`Unknown book in cart: ${line.id}`},{status:400});const quantity=Math.max(1,Math.min(10,Math.floor(line.quantity)||1));totalPaise+=Math.round(book.priceINR*100)*quantity;items.push({title:book.title,quantity,price:book.priceINR});ids.push(book.id)}
    const order=await razorpay.orders.create({amount:totalPaise,currency:'INR',receipt:`rcpt_${Date.now()}`,payment_capture:true,notes:{userId:user.id,bookIds:ids.join(',')}})
    const {error}=await client.from('orders').insert({id:order.id,user_id:user.id,order_number:order.id,total:totalPaise/100,status:'Processing',items})
    if(error) throw error
    return NextResponse.json({orderId:order.id,amount:totalPaise,currency:'INR',keyId:process.env.RAZORPAY_KEY_ID,prefillEmail:user.email})
  } catch(err){console.error('Checkout error:',err);return NextResponse.json({error:'Could not start checkout. Please try again.'},{status:500})}
}
