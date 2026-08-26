import { Link } from 'react-router-dom'
import { MarketingLayout, PageHero } from '../../components/site/MarketingLayout'
import {
  Accordion,
  Button,
  Card,
  Chip,
  Container,
  Eyebrow,
  Reveal,
  Section,
  SectionHeading,
  Stat,
} from '../../components/site/ui'
import {
  PhotoFrame,
  PitchFloor,
  SeamBall,
  StadiumAtmosphere,
  TrajectoryArc,
} from '../../components/site/visuals'

/* ===========================================================================
   Diagrams
   Drawn in place rather than added to visuals.tsx because they only ever teach
   one thing: where to stand. Plan view for the two camera positions, elevation
   for the framing.
   ======================================================================== */

/** Plan view: side-on Action clip — camera square to the bowler. */
function ActionCameraDiagram() {
  return (
    <svg
      viewBox="0 0 600 360"
      className="h-full w-full"
      role="img"
      aria-label="Plan view of a cricket pitch. The camera stands square to the bowler, eight to twelve metres out from the pitch, at a right angle to it, with the bowler inside its field of view. A second camera position at an angle is marked as one to avoid."
    >
      <defs>
        <linearGradient id="recPlanPitch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12513c" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#0b3d2e" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="recCone" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#b6f24a" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#b6f24a" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Pitch */}
      <rect x="130" y="62" width="430" height="88" rx="4" fill="url(#recPlanPitch)" stroke="rgba(255,255,255,0.14)" />
      <text x="360" y="112" textAnchor="middle" fill="rgba(255,255,255,0.16)" fontSize="15" fontWeight="700" letterSpacing="6">
        PITCH
      </text>

      {/* Creases */}
      <line x1="178" y1="68" x2="178" y2="144" stroke="rgba(246,249,247,0.45)" strokeWidth="2" />
      <line x1="508" y1="68" x2="508" y2="144" stroke="rgba(246,249,247,0.45)" strokeWidth="2" />

      {/* Stumps, both ends */}
      {[98, 106, 114].map((y) => (
        <circle key={`b${y}`} cx="150" cy={y} r="3.4" fill="rgba(246,249,247,0.85)" />
      ))}
      {[98, 106, 114].map((y) => (
        <circle key={`t${y}`} cx="536" cy={y} r="3.4" fill="rgba(246,249,247,0.85)" />
      ))}

      {/* Run-up */}
      <line x1="36" y1="106" x2="130" y2="106" stroke="rgba(246,249,247,0.35)" strokeWidth="2" strokeDasharray="7 6" />
      <polygon points="144,106 130,99 130,113" fill="rgba(246,249,247,0.45)" />
      <text x="80" y="94" textAnchor="middle" fill="rgba(246,249,247,0.45)" fontSize="13">
        run-up
      </text>

      {/* Field of view */}
      <polygon points="170,268 66,30 274,30" fill="url(#recCone)" />
      <line x1="170" y1="268" x2="66" y2="30" stroke="rgba(182,242,74,0.35)" strokeWidth="1.5" strokeDasharray="6 5" />
      <line x1="170" y1="268" x2="274" y2="30" stroke="rgba(182,242,74,0.35)" strokeWidth="1.5" strokeDasharray="6 5" />

      {/* Bowler at release + batter */}
      <circle cx="170" cy="106" r="11" fill="#b6f24a" stroke="#05090a" strokeWidth="2" />
      <text x="170" y="48" textAnchor="middle" fill="#b6f24a" fontSize="15" fontWeight="700" letterSpacing="1.5">
        BOWLER
      </text>
      <circle cx="518" cy="106" r="10" fill="rgba(246,249,247,0.5)" />
      <text x="518" y="48" textAnchor="middle" fill="rgba(246,249,247,0.5)" fontSize="15" fontWeight="700" letterSpacing="1.5">
        BATTER
      </text>

      {/* Right angle at the pitch edge */}
      <path d="M170 168 L188 168 L188 150" fill="none" stroke="rgba(246,249,247,0.45)" strokeWidth="1.6" />
      <text x="196" y="167" fill="rgba(246,249,247,0.55)" fontSize="13">
        90°
      </text>

      {/* Distance */}
      <line x1="170" y1="150" x2="170" y2="266" stroke="rgba(182,242,74,0.45)" strokeWidth="1.6" strokeDasharray="6 5" />
      <line x1="162" y1="150" x2="178" y2="150" stroke="rgba(182,242,74,0.55)" strokeWidth="2" />
      <rect x="184" y="194" width="98" height="28" rx="14" fill="rgba(5,9,10,0.85)" stroke="rgba(182,242,74,0.35)" />
      <text x="233" y="213" textAnchor="middle" fill="#b6f24a" fontSize="15" fontWeight="700">
        8–12 m
      </text>

      {/* The camera */}
      <circle cx="170" cy="269" r="3.5" fill="#b6f24a" />
      <rect x="138" y="272" width="64" height="38" rx="7" fill="#0b1113" stroke="#b6f24a" strokeWidth="2" />
      <rect x="145" y="278" width="50" height="26" rx="3" fill="rgba(182,242,74,0.14)" />
      <text x="170" y="331" textAnchor="middle" fill="#b6f24a" fontSize="14" fontWeight="700" letterSpacing="1.2">
        YOUR CAMERA
      </text>
      <text x="170" y="349" textAnchor="middle" fill="rgba(246,249,247,0.45)" fontSize="13">
        landscape · waist height
      </text>

      {/* The position to avoid */}
      <g transform="translate(432 284) rotate(-28)">
        <rect x="-32" y="-19" width="64" height="38" rx="7" fill="none" stroke="rgba(248,113,113,0.55)" strokeWidth="2" strokeDasharray="5 4" />
      </g>
      <line x1="422" y1="274" x2="442" y2="294" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
      <line x1="442" y1="274" x2="422" y2="294" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
      <text x="432" y="331" textAnchor="middle" fill="rgba(248,113,113,0.8)" fontSize="13" fontWeight="600">
        angled — avoid
      </text>
    </svg>
  )
}

/** Plan view: behind the bowler's end for the Ball flight clip. */
function BallFlightCameraDiagram() {
  return (
    <svg
      viewBox="0 0 520 250"
      className="h-full w-full"
      role="img"
      aria-label="Plan view of a cricket pitch from behind the non-striker's end. The camera sits two to three metres behind the stumps, in line with the pitch, with both sets of stumps inside its field of view."
    >
      <defs>
        <linearGradient id="recPlanPitch2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12513c" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#0b3d2e" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="recCone2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b6f24a" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#b6f24a" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Field of view down the pitch */}
      <polygon points="92,134 500,52 500,216" fill="url(#recCone2)" />
      <line x1="92" y1="134" x2="500" y2="52" stroke="rgba(182,242,74,0.3)" strokeWidth="1.5" strokeDasharray="6 5" />
      <line x1="92" y1="134" x2="500" y2="216" stroke="rgba(182,242,74,0.3)" strokeWidth="1.5" strokeDasharray="6 5" />

      {/* Pitch */}
      <rect x="118" y="86" width="360" height="96" rx="4" fill="url(#recPlanPitch2)" stroke="rgba(255,255,255,0.14)" />
      <line x1="92" y1="134" x2="470" y2="134" stroke="rgba(182,242,74,0.35)" strokeWidth="1.5" strokeDasharray="5 6" />

      {/* Both sets of stumps, ringed */}
      <circle cx="138" cy="134" r="18" fill="none" stroke="rgba(182,242,74,0.6)" strokeWidth="1.8" />
      <circle cx="458" cy="134" r="18" fill="none" stroke="rgba(182,242,74,0.6)" strokeWidth="1.8" />
      {[126, 134, 142].map((y) => (
        <circle key={`n${y}`} cx="138" cy={y} r="3.2" fill="rgba(246,249,247,0.9)" />
      ))}
      {[126, 134, 142].map((y) => (
        <circle key={`f${y}`} cx="458" cy={y} r="3.2" fill="rgba(246,249,247,0.9)" />
      ))}

      {/* Caption badge */}
      <rect x="158" y="30" width="228" height="30" rx="15" fill="rgba(5,9,10,0.85)" stroke="rgba(182,242,74,0.35)" />
      <text x="272" y="50" textAnchor="middle" fill="#b6f24a" fontSize="14" fontWeight="700">
        both sets of stumps in shot
      </text>

      {/* Camera behind the non-striker's end */}
      <circle cx="93" cy="134" r="3.5" fill="#b6f24a" />
      <rect x="34" y="115" width="58" height="38" rx="7" fill="#0b1113" stroke="#b6f24a" strokeWidth="2" />
      <rect x="41" y="121" width="44" height="26" rx="3" fill="rgba(182,242,74,0.14)" />
      <text x="63" y="178" textAnchor="middle" fill="#b6f24a" fontSize="13" fontWeight="700" letterSpacing="1.2">
        CAMERA
      </text>
      <text x="63" y="196" textAnchor="middle" fill="rgba(246,249,247,0.45)" fontSize="12">
        2–3 m back
      </text>
    </svg>
  )
}

/** Elevation: what the frame should hold, and how high to hold the phone. */
function FramingDiagram() {
  return (
    <svg
      viewBox="0 0 460 260"
      className="h-full w-full"
      role="img"
      aria-label="A landscape video frame containing a bowler in the delivery stride, with the ball above the head and both feet inside the frame, and the camera held level with the bowler's waist."
    >
      <defs>
        <linearGradient id="recBone" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b6f24a" />
          <stop offset="100%" stopColor="#2f9e6b" />
        </linearGradient>
      </defs>

      <text x="212" y="30" textAnchor="middle" fill="#b6f24a" fontSize="15" fontWeight="700" letterSpacing="1.4">
        WHOLE BODY IN FRAME
      </text>

      {/* The video frame */}
      <rect x="40" y="48" width="344" height="193" rx="8" fill="rgba(182,242,74,0.03)" stroke="rgba(182,242,74,0.5)" strokeWidth="2" strokeDasharray="8 6" />
      {[
        [40, 48, 1, 1],
        [384, 48, -1, 1],
        [40, 241, 1, -1],
        [384, 241, -1, -1],
      ].map(([x, y, sx, sy], i) => (
        <path
          key={i}
          d={`M${x} ${y + sy * 22} L${x} ${y} L${x + sx * 22} ${y}`}
          fill="none"
          stroke="#b6f24a"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}

      {/* Ground */}
      <line x1="52" y1="214" x2="372" y2="214" stroke="rgba(246,249,247,0.25)" strokeWidth="1.5" />

      {/* Bowler in the delivery stride */}
      <g stroke="url(#recBone)" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M172 120 L218 117" />
        <path d="M172 120 L152 100 L146 76" />
        <path d="M218 117 L238 142 L246 166" />
        <path d="M196 107 L193 155" />
        <path d="M178 158 L208 156" />
        <path d="M178 158 L156 186 L140 214" />
        <path d="M208 156 L232 182 L252 212" />
      </g>
      <circle cx="196" cy="96" r="11" fill="none" stroke="url(#recBone)" strokeWidth="4" />
      {[
        [172, 120],
        [218, 117],
        [152, 100],
        [238, 142],
        [178, 158],
        [208, 156],
        [156, 186],
        [232, 182],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3.4" fill="#f6f9f7" />
      ))}
      <circle cx="146" cy="70" r="6.5" fill="#b91c1c" stroke="#f6f2e6" strokeWidth="1.2" />

      {/* Camera height */}
      <line x1="252" y1="157" x2="404" y2="157" stroke="rgba(182,242,74,0.5)" strokeWidth="1.6" strokeDasharray="6 5" />
      <rect x="268" y="145" width="98" height="26" rx="13" fill="rgba(5,9,10,0.85)" stroke="rgba(182,242,74,0.35)" />
      <text x="317" y="163" textAnchor="middle" fill="#b6f24a" fontSize="14" fontWeight="700">
        waist height
      </text>
      <circle cx="404" cy="157" r="3.2" fill="#b6f24a" />
      <rect x="404" y="140" width="48" height="34" rx="6" fill="#0b1113" stroke="#b6f24a" strokeWidth="2" />
      <rect x="410" y="146" width="36" height="22" rx="3" fill="rgba(182,242,74,0.14)" />

      <text x="196" y="234" textAnchor="middle" fill="rgba(246,249,247,0.45)" fontSize="12">
        front foot and back foot both in shot
      </text>
    </svg>
  )
}

/* ===========================================================================
   Content
   ======================================================================== */

const ACTION_NOTES = [
  {
    title: 'Square to the bowler',
    body: 'Stand out from the side of the pitch, level with the popping crease. You want the bowler side-on: chest across the frame, bowling arm coming over towards you, not away from you.',
  },
  {
    title: 'Eight to twelve metres out',
    body: 'Close enough that the bowler fills a good part of the frame, far enough that the whole delivery stride happens without the camera having to move.',
  },
  {
    title: 'Roughly waist height',
    body: 'Hip or waist height on the bowler. Filming from the ground exaggerates the arm; filming from a balcony flattens the stride.',
  },
  {
    title: 'Whole body, start to finish',
    body: 'The ball above the head, both feet on the ground, and enough room either side that the follow-through does not walk out of shot.',
  },
]

const FLIGHT_NOTES = [
  {
    title: 'Behind the non-striker',
    body: 'Two or three paces back from the stumps at the bowler’s end, on the line of the pitch — the umpire’s view, just further back.',
  },
  {
    title: 'Both sets of stumps in shot',
    body: 'If you can see the stumps at both ends without moving the phone, the ball has somewhere to travel through on screen. That is the whole trick.',
  },
  {
    title: 'Stay out of the way',
    body: 'Bowler’s run-up first, safety always. Set the phone on a bag or a stump-height stand rather than standing in the line yourself.',
  },
]

const DOS_AND_DONTS = [
  {
    topic: 'Angle',
    good: 'Square to the bowler, on the line of the crease.',
    bad: 'Angled from mid-on, or tucked in behind the arm.',
  },
  {
    topic: 'Framing',
    good: 'Whole body: ball above the head down to both feet.',
    bad: 'Feet cropped off, or the arm cut at the top of the frame.',
  },
  {
    topic: 'Camera hold',
    good: 'Locked off — on a bag, a bench, a fence post or a tripod.',
    bad: 'Panning or tracking the bowler through the crease.',
  },
  {
    topic: 'Light',
    good: 'Sun or floodlights behind the camera, falling on the bowler.',
    bad: 'Shooting into the light — a bowler in silhouette shows nothing.',
  },
  {
    topic: 'Clip length',
    good: 'One delivery: a couple of strides of run-up to the follow-through.',
    bad: 'A whole over in a single two-minute take.',
  },
  {
    topic: 'Orientation',
    good: 'Landscape, every single time.',
    bad: 'Portrait — it throws away the run-up and clips the arm.',
  },
  {
    topic: 'Background',
    good: 'A background the ball reads against: sightscreen, dark netting, plain wall.',
    bad: 'A red ball against a brick wall, or a white ball against white cloud.',
  },
]

const SETTINGS = [
  {
    tag: 'Frame rate',
    title: 'The highest your phone offers',
    body: 'Slow-motion is ideal — 120 or 240 fps if it is there. The faster the capture, the more of the arm coming over survives on screen instead of smearing into one frame.',
  },
  {
    tag: 'Orientation',
    title: 'Landscape',
    body: 'Turn the phone sideways. A bowler in the delivery stride is a wide shape, and portrait cuts off exactly the bits that matter.',
  },
  {
    tag: 'Focus',
    title: 'Lock focus and exposure',
    body: 'Tap and hold on the bowler until the phone locks. Otherwise it will re-focus mid-run-up and hunt through the delivery.',
  },
  {
    tag: 'Lens',
    title: 'Wipe the lens first',
    body: 'Ten seconds with a shirt sleeve. A pocket-smeared lens softens the ball far more than most people expect, especially under lights.',
  },
  {
    tag: 'Length',
    title: 'One delivery per clip',
    body: 'Start recording as the bowler turns at the top of the mark, stop after the follow-through. Six seconds is plenty.',
  },
  {
    tag: 'Release',
    title: 'Keep the ball in frame after release',
    body: 'Do not stop the moment the ball leaves the hand. Let it run on — the flight after release is half the story.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Pick the spot',
    body: 'Walk out square to the popping crease, eight to twelve metres from the pitch. Check the light is behind you and the background is clean.',
  },
  {
    n: '02',
    title: 'Set the phone',
    body: 'Slow-motion on, landscape, lens wiped. Prop it at waist height on a kit bag or a stand so nobody has to hold it steady.',
  },
  {
    n: '03',
    title: 'Frame the bowler',
    body: 'Ask for a walk-through of the delivery stride and check the whole body stays in frame, with air above the arm and both feet showing.',
  },
  {
    n: '04',
    title: 'Lock and roll',
    body: 'Tap and hold to lock focus and exposure, then start recording as the bowler turns at the top of the mark.',
  },
  {
    n: '05',
    title: 'Bowl one',
    body: 'One delivery. Let the recording run through the follow-through and a beat beyond, so the ball is still in shot after release.',
  },
  {
    n: '06',
    title: 'Watch it back',
    body: 'Check the clip before anyone moves. Whole body, steady, sharp, ball visible? If not, film it again now — it costs one ball.',
  },
]

const TROUBLESHOOTING = [
  {
    q: 'The ball is a blur',
    a: 'That is a light and shutter problem, not a you problem. Move to the brightest part of the ground, switch to the highest frame rate your phone has, and if it offers a slow-motion mode use that instead of standard video. Indoors, a blurred ball usually means the nets are simply too dark for the phone to freeze it.',
  },
  {
    q: 'Indoor nets are dark',
    a: 'Get everything you can on your side: film down the lit lane rather than across it, keep the bowler between you and the brightest lights, and pick a lane whose back netting is dark so the ball stands out. Slow-motion in a dim hall can look worse than normal video — if the clip comes out murky, drop back to the standard frame rate and keep the light instead.',
  },
  {
    q: 'My clip is very large',
    a: 'Trim it before you upload. Most phones let you drag the ends of a clip in the photo gallery — cut it to the single delivery and the file usually shrinks to a fraction of the size. Six seconds at the highest frame rate beats a two-minute over at a lower one, every time.',
  },
  {
    q: 'My phone only shoots 30fps',
    a: 'You will still get a read. The fastest part of the action — the arm coming over and the moment of release — is thinner on screen at 30fps, so expect release timings to come back with lower confidence and treat ball speed as a guide rather than a gun reading. Everything about the run-up, the stride and the follow-through holds up fine.',
  },
  {
    q: 'The bowler is left-arm',
    a: 'Mirror the whole set-up. Stand on the other side of the pitch so the camera still looks across the bowler’s chest with the bowling arm coming over towards you, and set the bowling arm when you upload so the numbers come back the right way round.',
  },
  {
    q: 'Can I film through the net?',
    a: 'You can, and often you have to. Hold the lens as close to the mesh as it will go — the closer it is, the more the netting disappears. Avoid shooting through two layers of net, and never through a net that is catching direct sunlight, which turns the mesh into a bright grid across the bowler.',
  },
]

export function RecordVideoPage() {
  return (
    <MarketingLayout title="Record a Video">
      <PageHero
        eyebrow="Filming guide"
        title={
          <>
            A good read starts with a{' '}
            <span className="text-gradient-lime">good clip</span>
          </>
        }
        lead="CricLab can only report what the camera actually saw. Three minutes spent getting the position, the light and the framing right is the difference between a delivery you can coach from and a clip that reads short."
      >
        <div className="flex flex-wrap gap-3 pt-1">
          <Button to="/app" size="lg">
            Open CricLab
            <span aria-hidden>→</span>
          </Button>
          <Button href="#checklist" variant="secondary" size="lg">
            Jump to the checklist
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <Chip tone="lime">One delivery</Chip>
          <Chip>Landscape</Chip>
          <Chip>Side-on</Chip>
          <Chip>Whole body</Chip>
        </div>
      </PageHero>

      {/* ===================== WHAT A GOOD CLIP LOOKS LIKE ===================== */}
      <Section tone="plain" className="py-20 sm:py-24">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <Reveal>
              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-pitch/10 blur-2xl" aria-hidden />
                <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-pitch/10 bg-night shadow-2xl shadow-pitch/20">
                  <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                    <span className="h-2 w-2 animate-pulse-bar rounded-full bg-ball" />
                    <span className="text-xs font-semibold text-chalk/55">REC</span>
                    <span className="ml-auto font-mono text-xs text-chalk/45">0:06</span>
                  </div>
                  <PhotoFrame
                    src="/hero-bowling.jpg"
                    alt="A side-on clip of a bowler in the delivery stride"
                    className="aspect-video rounded-none"
                  >
                    <div className="flex h-full flex-col justify-between p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <Chip tone="lime">Side-on</Chip>
                        <Chip tone="ok">Whole body in frame</Chip>
                      </div>
                      <div className="pointer-events-none absolute inset-6 rounded-lg border border-lime/35 sm:inset-8" />
                      <div className="flex flex-wrap gap-2">
                        <Chip>Landscape</Chip>
                        <Chip>240 fps</Chip>
                        <Chip>Focus locked</Chip>
                      </div>
                    </div>
                  </PhotoFrame>
                </div>
              </div>
            </Reveal>

            <div className="flex flex-col gap-7">
              <SectionHeading
                align="left"
                eyebrow="The input"
                title="The clip is the whole input"
                lead="No markers, no rig, no second camera. One phone, one delivery, filmed properly — everything CricLab tells you afterwards is read off that."
                className="max-w-none"
              />
              <div className="grid grid-cols-2 gap-6 sm:gap-8">
                <Reveal>
                  <Stat value={1} label="Delivery per clip" tone="light" />
                </Reveal>
                <Reveal delay={80}>
                  <Stat value={8} suffix="–12 m" label="Camera distance" tone="light" />
                </Reveal>
                <Reveal delay={160}>
                  <Stat value={240} suffix=" fps" label="Ideal frame rate" tone="light" />
                </Reveal>
                <Reveal delay={240}>
                  <Stat value={6} suffix=" sec" label="Clip length" tone="light" />
                </Reveal>
              </div>
              <Reveal delay={300}>
                <p className="text-sm leading-relaxed text-ink/55">
                  Two clip types, two positions.{' '}
                  <span className="font-semibold text-ink">Action</span> is filmed side-on
                  for the bowling action;{' '}
                  <span className="font-semibold text-ink">Ball flight</span> is filmed from
                  behind for the path of the ball. Both are below.
                </p>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ===================== CAMERA POSITION ===================== */}
      <Section tone="dark" className="py-24 sm:py-32">
        <Container>
          <SectionHeading
            tone="dark"
            eyebrow="Camera position"
            title="Where to stand"
            lead="Two positions cover everything CricLab looks at. Pace them out once at your ground and you will never have to think about it again."
          />

          <div className="mt-16 grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <Reveal>
              <Card className="p-4 sm:p-6" interactive={false}>
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                  <Chip tone="lime">Action clip</Chip>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-chalk/45">
                    Plan view
                  </span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-night/60 p-3 sm:p-4">
                  <ActionCameraDiagram />
                </div>
              </Card>
            </Reveal>

            <Reveal delay={140}>
              <div className="flex flex-col gap-5">
                <h3 className="font-display text-2xl font-extrabold text-chalk">
                  Side-on, square to the bowler
                </h3>
                <ul className="flex flex-col gap-4">
                  {ACTION_NOTES.map((n) => (
                    <li key={n.title} className="flex gap-3">
                      <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lime/15 text-[11px] font-bold text-lime">
                        ✓
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-chalk">{n.title}</span>
                        <span className="block pt-1 text-sm leading-relaxed text-chalk/60">
                          {n.body}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          <div className="mt-8 grid items-center gap-8 lg:grid-cols-2">
            <Reveal>
              <Card className="p-4 sm:p-6" interactive={false}>
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                  <Chip tone="lime">Framing</Chip>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-chalk/45">
                    What the frame holds
                  </span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-night/60 p-3 sm:p-4">
                  <FramingDiagram />
                </div>
              </Card>
            </Reveal>

            <Reveal delay={120}>
              <Card className="p-4 sm:p-6" interactive={false}>
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                  <Chip tone="lime">Ball flight clip</Chip>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-chalk/45">
                    Behind the bowler
                  </span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-night/60 p-3 sm:p-4">
                  <BallFlightCameraDiagram />
                </div>
              </Card>
            </Reveal>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {FLIGHT_NOTES.map((n, i) => (
              <Reveal key={n.title} delay={i * 90}>
                <Card className="flex h-full flex-col gap-2.5 p-6">
                  <h3 className="font-display text-lg font-bold text-chalk">{n.title}</h3>
                  <p className="text-sm leading-relaxed text-chalk/60">{n.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200} className="mt-10">
            <div className="flex flex-col items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:flex-row sm:items-center">
              <div className="h-20 w-32 shrink-0">
                <TrajectoryArc />
              </div>
              <p className="text-sm leading-relaxed text-chalk/60">
                The ball-flight clip is the one people rush. Give the ball room to travel
                on screen — both sets of stumps in shot, phone still, nothing crossing the
                line — and the path comes back drawn cleanly over your own footage.
              </p>
            </div>
          </Reveal>
        </Container>
        <PitchFloor />
      </Section>

      {/* ===================== DO / DON'T ===================== */}
      <Section tone="light" className="py-24 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow="Do this, not that"
            title="Seven decisions that make or break a clip"
            lead="Every one of these costs nothing to get right and everything to get wrong. Read them once before your first session."
          />

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DOS_AND_DONTS.map((d, i) => (
              <Reveal
                key={d.topic}
                delay={i * 70}
                className={i === DOS_AND_DONTS.length - 1 ? 'sm:col-span-2 lg:col-span-3' : ''}
              >
                <Card tone="light" className="flex h-full flex-col gap-4 p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-pitch font-display text-xs font-extrabold text-lime">
                      {i + 1}
                    </span>
                    <h3 className="font-display text-lg font-bold text-ink">{d.topic}</h3>
                  </div>
                  <div className="flex gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-pitch text-[12px] font-bold text-lime">
                      ✓
                    </span>
                    <p className="text-sm leading-relaxed text-ink/75">{d.good}</p>
                  </div>
                  <div className="flex gap-3 border-t border-pitch/10 pt-4">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ball/10 text-[12px] font-bold text-ball">
                      ✗
                    </span>
                    <p className="text-sm leading-relaxed text-ink/50">{d.bad}</p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ===================== SETTINGS CHECKLIST ===================== */}
      <Section tone="pitch" id="checklist" className="scroll-mt-24 py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 bg-grid-tech opacity-40" aria-hidden />
        <Container className="relative">
          <SectionHeading
            tone="dark"
            eyebrow="Before you press record"
            title="The six-point settings check"
            lead="Thirty seconds on the phone before the bowler walks back to their mark. It is the same six every time."
          />

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SETTINGS.map((s, i) => (
              <Reveal key={s.title} delay={i * 70}>
                <Card className="flex h-full flex-col gap-3 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <Chip tone="lime">{s.tag}</Chip>
                    <span className="grid h-7 w-7 place-items-center rounded-full border border-lime/40 text-[12px] font-bold text-lime">
                      ✓
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-chalk">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-chalk/60">{s.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200} className="mt-10 text-center">
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-chalk/55">
              If you only remember two of them:{' '}
              <span className="font-semibold text-lime">landscape</span> and{' '}
              <span className="font-semibold text-lime">one delivery per clip</span>. Those
              two fix most of the clips we are asked about.
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ===================== STEP BY STEP ===================== */}
      <Section tone="plain" className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="flex flex-col gap-6">
              <SectionHeading
                align="left"
                eyebrow="Step by step"
                title="Filming a delivery, start to finish"
                lead="Six steps, about three minutes the first time and under one after that."
                className="max-w-none"
              />
              <Reveal delay={120}>
                <div className="hidden lg:block">
                  <SeamBall size={110} className="animate-float-slow opacity-90" />
                </div>
              </Reveal>
            </div>

            <ol className="flex flex-col gap-4">
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 70} as="li">
                  <Card tone="light" className="flex gap-5 p-6">
                    <span className="font-display text-2xl font-extrabold text-pitch/25 sm:text-3xl">
                      {s.n}
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-display text-lg font-bold text-ink">{s.title}</h3>
                      <p className="text-sm leading-relaxed text-ink/65">{s.body}</p>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      {/* ===================== TROUBLESHOOTING ===================== */}
      <Section tone="dark" className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="flex flex-col gap-6">
              <SectionHeading
                tone="dark"
                align="left"
                eyebrow="Troubleshooting"
                title="When the ground will not co-operate"
                lead="Dark nets, cheap phones, red balls against brick. Here is what actually helps."
                className="max-w-none"
              />
              <Reveal delay={120}>
                <div className="flex flex-wrap gap-3">
                  <Button to="/faq" variant="secondary">
                    Full FAQ
                  </Button>
                  <Link
                    to="/contact"
                    className="inline-flex items-center px-2 py-3 text-sm font-semibold text-lime transition hover:text-chalk"
                  >
                    Send us the clip →
                  </Link>
                </div>
              </Reveal>
            </div>

            <Accordion tone="dark" items={TROUBLESHOOTING} />
          </div>
        </Container>
      </Section>

      {/* ===================== CTA ===================== */}
      <Section tone="light" className="py-20 sm:py-28">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-stadium px-7 py-16 text-center text-chalk sm:px-14">
              <StadiumAtmosphere />
              <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
                <Eyebrow>Ready</Eyebrow>
                <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-[2.6rem]">
                  You know where to stand.{' '}
                  <span className="text-gradient-lime">Go and film one.</span>
                </h2>
                <p className="text-base leading-relaxed text-chalk/65">
                  Six seconds, one delivery, side-on. Upload it with the bowler’s height and
                  bowling arm and see the whole action come back measured.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button to="/app" size="lg">
                    Start Analyzing
                    <span aria-hidden>→</span>
                  </Button>
                  <Button to="/how-it-works" variant="secondary" size="lg">
                    See how it works
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </MarketingLayout>
  )
}
