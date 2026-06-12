import { Shield, Phone, LifeBuoy, Users, MessageSquareHeart } from "lucide-react";

export default function SupportHub() {
  return (
    <div className="bg-white border border-[#E0DBCF] rounded-[28px] p-6 shadow-sm flex flex-col justify-between h-full min-h-[420px]" id="support-circles-card">
      <div className="w-full flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="p-2 bg-[#EBE9E1] rounded-full text-[#7D8461]">
              <Shield className="w-4 h-4" />
            </span>
            <h3 className="font-serif font-semibold text-[#2C2C24] text-base">Support Circles</h3>
          </div>
          <p className="text-xs text-[#6B6B58] leading-relaxed mb-4">
            If you are going through a tough time, please remember that you do not have to carry everything by yourself. There are kind, caring people ready to listen and help out.
          </p>
        </div>

        {/* Resources section */}
        <div className="space-y-3 my-2 flex-1 max-h-[220px] overflow-y-auto pr-1">
          <div className="bg-white border border-[#E0DBCF]/80 rounded-xl p-3 flex gap-3 items-start shadow-2xs">
            <Users className="w-5 h-5 text-[#7D8461] mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-[#2C2C24] leading-tight">School Counselor & Trusted Adults</h4>
              <p className="text-[11px] text-[#6B6B58] mt-1 leading-relaxed">
                Your school counselors, teachers, parents, or guardians are here because they truly care. Talking to someone is often the fastest way to get relief.
              </p>
            </div>
          </div>

          <div className="bg-[#EBE9E1]/30 border border-[#E0DBCF]/60 rounded-xl p-3 flex gap-3 items-start shadow-2xs">
            <Phone className="w-5 h-5 text-[#7D8461] mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-[#2C2C24] leading-tight">988 Lifeline (Free & confidential, 24/7)</h4>
              <p className="text-[11px] text-[#6B6B58] mt-1 leading-relaxed flex flex-col gap-1">
                <span>Call or text <strong>988</strong> to connect with crisis services. It is confidential, calm, and operates 24 hours a day.</span>
                <span className="text-[10px] text-[#7D8461] font-semibold mt-0.5">• Text HOME to <strong>741741</strong> for the Crisis Text Line.</span>
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#E0DBCF]/80 rounded-xl p-3 flex gap-3 items-start shadow-2xs">
            <MessageSquareHeart className="w-5 h-5 text-[#6B6B58] mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-[#2C2C24] leading-tight">How to start the conversation:</h4>
              <p className="text-[11px] text-[#6B6B58] mt-1 leading-relaxed italic">
                "I have been feeling really overwhelmed lately, and I wanted to tell you so I don't feel so alone. Can we talk?"
              </p>
            </div>
          </div>
        </div>

        {/* Safety Note */}
        <div className="bg-[#F5F5F0]/60 border border-[#E0DBCF]/65 p-2.5 rounded-xl text-center mt-3">
          <p className="text-[10px] text-[#4A4A3F] font-sans leading-relaxed">
            <LifeBuoy className="w-3.5 h-3.5 inline-block mr-1 text-[#7D8461] shrink-0" />
            <strong>Safe Zone:</strong> Choosing to reach for help is a sign of immense courage. You deserve to feel safe, valued, and happy.
          </p>
        </div>
      </div>
    </div>
  );
}
