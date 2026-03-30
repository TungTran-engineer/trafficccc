import React from 'react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();

  const stats = [
    { value: "10M+", label: "Commutes Optimized" },
    { value: "40%", label: "Reduction in Congestion" },
    { value: "1.2B", label: "Liters of Fuel Saved" }
  ];

  const pillars = [
    { icon: "bolt", title: "Innovation", desc: "Pushing the boundaries of predictive ML for traffic forecasting." },
    { icon: "gps_fixed", title: "Precision", desc: "Sub-second latency for real-time signal synchronization." },
    { icon: "verified_user", title: "Safety", desc: "Failsafe protocols designed for mission-critical urban hubs." },
    { icon: "eco", title: "Sustainability", desc: "Lowering the carbon footprint of every city we optimize." }
  ];

  const technologies = [
    { icon: "psychology", title: "AI Neural Engine", desc: "Proprietary LLMs trained on 50 years of global traffic patterns." },
    { icon: "sensors", title: "Real-time Sensor Network", desc: "IoT nodes capturing high-fidelity flow data across entire metro areas." },
    { icon: "cloud", title: "Edge Computing Cloud", desc: "Distributed processing for zero-latency response times." }
  ];

  const team = [
    { name: "Nguyen Quoc Cuong", role: "Chief Executive Officer", image: "https://scontent.fdad3-1.fna.fbcdn.net/v/t39.30808-6/553752539_122175220232607773_1451722980492806249_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=1d70fc&_nc_eui2=AeF3gv8ORQ2QsIUvrbAOd34bxL6XkQ9F6YLEvpeRD0XpgsUZnr6jh3laeSSAiqs99lTzDdD0Xdc-_2s30NjDCJuo&_nc_ohc=LbBJjt36xFUQ7kNvwHmikth&_nc_oc=AdolmA5tqtJtYS_HR0RjbCElSj0qWGpMl4WLpfd1GHoH5SrRj7yx2DOt9YT6BW5oW6g&_nc_zt=23&_nc_ht=scontent.fdad3-1.fna&_nc_gid=Bm9ogdKxSRSt8tQlcE0Ieg&_nc_ss=7a32e&oh=00_AfxIwF3uAAIy4qs2ZywmMociT3DyZzOM2EmWKnmQEzZgJA&oe=69C97844" },
    { name: "Nguyen Ngoc Nhan", role: "Chief Technology Officer", image: "https://scontent.fdad3-5.fna.fbcdn.net/v/t1.6435-9/129173156_230749205134165_1160668331337376404_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=53a332&_nc_eui2=AeGpTPfymdlamKesP9pd5O7GDy__QWmtdfkPL_9Baa11-c23hrHUsIoxzhHY9S4ieriguWvU4Bo6iqrL3Ep_0EH_&_nc_ohc=QM5OEHMwhW0Q7kNvwGYHnYh&_nc_oc=Adqdzb2zkdz8vZIrCGhrJrZ1nsC7l4As-JfyX24BcxVqlWnPqhOYIXvFkcOLq-b75k0&_nc_zt=23&_nc_ht=scontent.fdad3-5.fna&_nc_gid=WqNO86vxnyne7OtmHqiXTw&_nc_ss=7a32e&oh=00_Afy3x_QQCt7EmbQljQE-t-ZDCu4xp8Zpryh46ZpnypibXg&oe=69EAF972" },
    { name: "Tran Hong Tung", role: "Lead AI Architect", image: "https://scontent.fdad3-1.fna.fbcdn.net/v/t39.30808-6/476115702_1673639690163440_7123915157499937480_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=53a332&_nc_eui2=AeGPPZjyHMHFxh6yV_3prYkQ7DH1sTB_PcTsMfWxMH89xFr31C-BURYyzzKEVosAGP1cfZ1QOtl_5mS-XhufBpK0&_nc_ohc=4DXemGCO8MYQ7kNvwEmYZf3&_nc_oc=AdqPRQsbMFldwrGrvyOZnrrGoOsub0dACnoD37DAYqU8Sj6ALBbNllfqk_60u6d0sg4&_nc_zt=23&_nc_ht=scontent.fdad3-1.fna&_nc_gid=407VYoePbq7hdwoHKgk1nA&_nc_ss=7a32e&oh=00_AfxYduApmbLKWmjArsnkViB4RxHz2787Wr1qtD4I-GXybg&oe=69C96A6D" },
    { name: "Tran Van Thien", role: "VP of Operations", image: "https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/e711f0e4299e8c8c51aca35d2d3ca188~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=747b5d73&x-expires=1774594800&x-signature=Z83fK%2BgDsocgUZiXfC2qsXz93tw%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=sg1" }
  ];

  return (
    <div className="h-full overflow-y-auto bg-[#f7f5f8]">
      <div className="max-w-6xl mx-auto p-6 space-y-12">
        {/* Hero Section */}
        <section className="relative h-[400px] rounded-2xl overflow-hidden flex flex-col justify-center px-8 text-white">
          <div className="absolute inset-0 z-0">
            <img 
              alt="Cyberpunk city traffic" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPBnhQansIkT2wzP7uPkP295azUcikzkhc_fEBUyfFVBHjvXt2dpN6nZaO42hw6e9uBdy82r24pg5thmKozUjj1ewTkBYirg4XNCP2TOIBS7QwRYDJpL7RjwyWqlwhpzGEx7D1UTfWaDgMY1EP5MgAbty5R6NwIMlw4KA6VojeuZq_0owxxRUUJjYtLnXR_4gxRPB6XlkC3ZpTm9qL0Q2wV9RXyThcfyvPkBiaE6RtYtQtv86s5FEWvFXxvpE27khO6D4wYGGrxsY"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
          </div>
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="uppercase tracking-widest text-xs font-bold text-primary px-3 py-1 bg-primary/10 backdrop-blur-md rounded-lg inline-block">
              Vision 2030
            </span>
            <h1 className="text-4xl font-extrabold tracking-tighter leading-tight text-white">
              The Future of Urban Mobility
            </h1>
            <p className="text-slate-300 text-base leading-relaxed">
              Solving global traffic congestion through autonomous AI orchestration and real-time neural grid processing. We're not just moving cars; we're optimizing human time.
            </p>
            <div className="flex gap-3">
              <button className="bg-primary hover:bg-primary/90 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/30 text-sm">
                Explore Grid
              </button>
              <button className="bg-white/10 backdrop-blur-md hover:bg-white/20 px-6 py-3 rounded-xl font-bold transition-all text-sm">
                Watch Demo
              </button>
            </div>
          </div>
        </section>

        {/* Global Impact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl border-l-4 border-primary shadow-lg">
              <div className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
              <div className="uppercase tracking-wider text-[10px] font-bold text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Core Values */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tighter">Pillars of the Grid</h2>
            <p className="text-slate-500 text-sm mt-1">Engineered for resilience, built for society.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((pillar, index) => (
              <div key={index} className="bg-white p-5 rounded-2xl hover:bg-primary/5 transition-all duration-300 border border-transparent hover:border-primary/10">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary">{pillar.icon}</span>
                </div>
                <h3 className="font-bold text-base mb-1">{pillar.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Technology */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-slate-900 text-white rounded-2xl p-8 overflow-hidden relative">
          <div className="absolute right-0 top-0 w-1/2 h-full bg-primary/5 blur-3xl rounded-full"></div>
          <div className="space-y-6 relative z-10">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tighter">The Flux Core</h2>
              <p className="text-slate-400 text-sm">Our stack is designed to handle petabytes of transit data per hour.</p>
            </div>
            <div className="space-y-5">
              {technologies.map((tech, index) => (
                <div key={index} className="flex gap-3">
                  <div className="shrink-0 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">{tech.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{tech.title}</h4>
                    <p className="text-xs text-slate-400">{tech.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <img 
              alt="Server room blue lights" 
              className="rounded-2xl shadow-2xl relative z-10 w-full h-auto" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuApBMP7awltkQIMDdFQNlmLfpVugkg-fNvvMesBu6P8XmNRE_VEEDQfX7V_fRG_cAS8yRUXVz-EAWB4Y_UBQZv1sPSswG94Ojbnlye5CPUSp_wu0odmTWcjBAj-56jF5L3IPukd01wtP4ONkLlGio7nYnAvNjJTyTZWXMTQt_H3R1mLBMzEG6Xfa_jmiQqmBanyYc9g85wFBWlYIA1OIeT6b6w6ig0spuPukhW8eLzR3G6KuY40WpIXYklJMMn_ByVzayu_S0r4dnY"
            />
          </div>
        </section>

        {/* Leadership Team */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tighter">The Minds Behind the Flow</h2>
            <p className="text-slate-500 text-sm mt-1">World-class experts in urban planning and artificial intelligence.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="absolute inset-0 bg-primary/20 rounded-full scale-110 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <img 
                    alt={member.name} 
                    className="w-full h-full object-cover rounded-full border-2 border-primary/20 relative z-10" 
                    src={member.image}
                  />
                </div>
                <h4 className="font-bold text-base">{member.name}</h4>
                <p className="uppercase tracking-wider text-[10px] font-bold text-primary mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-primary/5 rounded-2xl p-8 text-center border border-primary/10 mb-8">
          <h2 className="text-2xl font-extrabold tracking-tighter mb-2">Ready to Optimize Your City?</h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto mb-6">
            Join the 50+ metropolitan grids already running on Violet Flux. Let's build a smarter flow together.
          </p>
          <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:shadow-2xl hover:shadow-primary/40 transition-all active:scale-95 text-sm">
            Inquire for Node Deployment
          </button>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;