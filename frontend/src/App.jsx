import { ArrowUpRight, BarChart3, BellRing, Building2, Check, ChevronRight, CircleDot, ClipboardCheck, Menu, Radar, ShieldCheck, Sparkles, Wrench, X } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Separator } from './components/ui/separator';

const features = [
  { number: '01', icon: Radar, title: 'Duplicate detection', text: 'Spot recurring failures before they become a chorus of disconnected tickets.', color: 'mint' },
  { number: '02', icon: BarChart3, title: 'Asset health engine', text: 'Turn maintenance history into a clear, living score for every campus asset.', color: 'coral' },
  { number: '03', icon: Wrench, title: 'Maintenance routing', text: 'Move the right issue to the right team with context already attached.', color: 'blue' },
];

const roles = [
  { icon: CircleDot, label: 'Students', description: 'Report and follow issues', tone: 'sand' },
  { icon: ClipboardCheck, label: 'Staff', description: 'Track campus requests', tone: 'mint' },
  { icon: Wrench, label: 'Maintenance', description: 'Resolve with clarity', tone: 'blue' },
  { icon: ShieldCheck, label: 'Admins', description: 'See the whole system', tone: 'coral' },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="CampusIQ home"><span className="brand-mark"><Building2 size={18} /></span><span>Campus<span className="brand-accent">IQ</span></span></a>
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Primary navigation"><a href="#intelligence" onClick={() => setMenuOpen(false)}>Intelligence</a><a href="#access" onClick={() => setMenuOpen(false)}>Who it&apos;s for</a><a href="#metrics" onClick={() => setMenuOpen(false)}>Impact</a><Button variant="ghost" size="sm">Sign in</Button><Button size="sm">Get started <ArrowUpRight size={15} /></Button></nav>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
      </header>

      <main id="top">
        <section className="hero section-wrap"><div className="hero-copy"><Badge variant="outline"><Sparkles size={13} /> Infrastructure, with intelligence</Badge><h1>Make every corner of campus <em>count.</em></h1><p className="hero-lede">One calm command center for the assets, issues, and people that keep your campus moving.</p><div className="hero-actions"><Button size="lg">Report an issue <ArrowUpRight size={17} /></Button><a className="text-link" href="#intelligence">Explore the platform <ChevronRight size={16} /></a></div><div className="trust-line"><span className="avatar-stack"><Avatar><AvatarFallback>AK</AvatarFallback></Avatar><Avatar><AvatarFallback>JM</AvatarFallback></Avatar><Avatar><AvatarFallback>RS</AvatarFallback></Avatar></span><span>Built for the people behind better campuses</span></div></div>
          <div className="hero-art" aria-label="Asset intelligence dashboard illustration"><div className="art-grid" /><div className="orbit orbit-one" /><div className="orbit orbit-two" /><Card className="dashboard-card"><div className="dash-top"><span className="dash-label"><span className="live-dot" />Live campus view</span><span className="dash-date">Today, 09:41</span></div><div className="dash-title"><div><span>Asset health</span><strong>84.6%</strong></div><Badge variant="success">+4.2%</Badge></div><div className="health-chart"><div className="chart-axis"><span>100</span><span>50</span><span>0</span></div><div className="chart-area"><div className="chart-fill" /><svg viewBox="0 0 350 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 96 C25 83 35 91 54 71 S86 75 105 63 S133 78 151 51 S182 59 200 38 S230 51 247 30 S277 38 294 17 S326 28 350 9" /></svg><div className="chart-point point-a" /><div className="chart-point point-b" /><div className="chart-point point-c" /></div></div><Separator /><div className="dash-bottom"><div><span className="mini-icon mint-bg"><Check size={13} /></span><span><b>128</b> assets healthy</span></div><div><span className="mini-icon coral-bg"><BellRing size={13} /></span><span><b>12</b> need attention</span></div></div></Card><Card className="alert-card"><span className="mini-icon coral-bg"><BellRing size={14} /></span><span><b>Recurring issue flagged</b><small>AC unit · Block C</small></span><ArrowUpRight size={14} /></Card><div className="art-caption"><span>01 / 03</span><span>See what needs you next</span></div></div>
        </section>

        <section className="metrics section-wrap" id="metrics"><div className="metric-intro"><span className="eyebrow">The pulse of your campus</span><p>Clarity you can act on, measured in real time.</p></div><div className="metric"><strong>2,840</strong><span>Total assets monitored <CircleDot size={13} /></span></div><div className="metric"><strong>96.8%</strong><span>Issues resolved on time <CircleDot size={13} /></span></div><div className="metric metric-status"><span className="status-ring"><Check size={15} /></span><span><b>All systems operational</b><small>Last checked 2 min ago</small></span></div></section>

        <section className="intelligence section-wrap" id="intelligence"><div className="section-heading"><div><span className="eyebrow">A sharper signal</span><h2>Less noise. More <em>know-how.</em></h2></div><p>CampusIQ connects the dots so your team can spend less time sorting requests and more time improving the place people share.</p></div><div className="feature-grid">{features.map(({ icon: Icon, ...feature }) => <Card className={`feature-card ${feature.color}`} key={feature.number}><div className="feature-meta"><span>{feature.number}</span><span className="feature-icon"><Icon size={19} /></span></div><h3>{feature.title}</h3><p>{feature.text}</p><a href="#access">Learn more <ArrowUpRight size={15} /></a></Card>)}</div></section>

        <section className="access section-wrap" id="access"><div className="section-heading access-heading"><div><span className="eyebrow">One platform, every role</span><h2>Your campus, <em>connected.</em></h2></div><p>A better day looks different depending on where you stand. Start from the view made for you.</p></div><div className="role-grid">{roles.map(({ icon: Icon, ...role }) => <Card className={`role-card ${role.tone}`} key={role.label}><span className="role-icon"><Icon size={21} /></span><div><h3>{role.label}</h3><p>{role.description}</p></div><ChevronRight size={18} className="role-arrow" /></Card>)}</div></section>
      </main>
      <footer className="site-footer section-wrap"><a className="brand" href="#top"><span className="brand-mark"><Building2 size={16} /></span><span>Campus<span className="brand-accent">IQ</span></span></a><span>Infrastructure that thinks ahead.</span><span>© 2026 CampusIQ</span></footer>
    </div>
  );
}

export default App;