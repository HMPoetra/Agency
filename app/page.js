// app/page.js
import {
  getStats, getPillars, getDivisions, getOfficersWithHours,
  getContracts, getPricingTiers, getProducts, getPublishedReviews,
  getSiteContent, getAlaCarte, getAlaCarteRanks
} from "@/lib/queries";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const { getContent } = await import("@/lib/queries");
  const [dbStats, dbPillars, dbDivisions, dbOfficers, dbContracts, dbPricing, dbProducts, dbReviews, dbContent, dbLiveContent, dbAlaCarte, dbAlaCarteRanks] =
    await Promise.all([
      getStats(),
      getPillars(),
      getDivisions(),
      getOfficersWithHours(),
      getContracts(),
      getPricingTiers(),
      getProducts(),
      getPublishedReviews(),
      getSiteContent(),
      getContent({ onlyActive: true }),
      getAlaCarte({ onlyActive: true }),
      getAlaCarteRanks({ onlyActive: true }),
    ]);

  const activeOfficers = dbOfficers.filter(o => o.status === 'Active').length;
  const activeContractsCount = dbContracts.filter(c => c.status === 'Active').length;
  
  // Calculate total hours from attendance_minutes + manual_minutes across all officers
  const totalMinutes = dbOfficers.reduce((acc, o) => acc + (Number(o.attendance_minutes) || 0) + (Number(o.manual_minutes) || 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);

  // Map DB rows back to the shape the components expect
  // Override stats with dynamic data
  const statsData = dbStats.map((s) => {
    let val = Number(s.value);
    let suff = s.suffix;
    
    if (s.label.toLowerCase().includes('personil')) {
      val = activeOfficers;
      suff = '+';
    } else if (s.label.toLowerCase().includes('partner')) {
      val = activeContractsCount;
      suff = '+';
    } else if (s.label.toLowerCase().includes('jam')) {
      // Format 1000 to 1K if over 1000
      if (totalHours >= 1000) {
        val = Math.floor(totalHours / 1000);
        suff = 'K+';
      } else {
        val = totalHours;
        suff = '+';
      }
    }
    
    return { label: s.label, value: val, suffix: suff };
  });

  const pillarsData = dbPillars;
  const divisionsData = dbDivisions
    .filter((d) => d.is_visible_on_dashboard)
    .map((d) => ({
      ...d,
      features: Array.isArray(d.features) ? d.features : JSON.parse(d.features ?? "[]"),
    }));
  const officersData = dbOfficers.map((o) => ({
    id: o.id,
    name: o.full_name,
    callsign: o.callsign,
    rank: o.rank,
    division: o.division,
    status: o.status,
    gender: o.gender,
    unit_task: o.unit_task,
    notes: o.notes,
    live_url: o.live_url,
    youtube_url: o.youtube_url || (o.live_url?.includes("youtu") ? o.live_url : ""),
    tiktok_url: o.tiktok_url || (o.live_url?.includes("tiktok") ? o.live_url : ""),
  }));
  const contractsData = dbContracts.map((c) => ({
    server: c.server_name,
    mou: c.mou_code,
    status: c.status,
    detail: c.detail,
    photo_url: c.photo_url,
  }));
  const pricingData = dbPricing.map((t) => ({
    name: t.name,
    tag: t.tag,
    icon_name: t.icon_name,
    price: t.price_idr,
    priceSuffix: '',
    period: t.billing_period,
    popular: t.is_popular,
    cta: t.cta_label,
    features: Array.isArray(t.features) ? t.features : JSON.parse(t.features ?? "[]"),
  }));
  const productsData = dbProducts.map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    icon_name: p.icon_name,
    price: p.price_idr,
    priceSuffix: '',
    badge: p.badge,
    description: p.description,
    features: Array.isArray(p.features) ? p.features : JSON.parse(p.features ?? "[]"),
  }));

  const reviewsData = dbReviews.map((r) => ({
    id: r.id,
    name_server: r.name_server,
    rating: r.rating,
    message: r.message,
    created_at: r.created_at,
  }));

  return (
    <HomeClient
      statsData={statsData}
      pillarsData={pillarsData}
      divisionsData={divisionsData}
      officersData={officersData}
      contractsData={contractsData}
      pricingData={pricingData}
      productsData={productsData}
      reviewsData={reviewsData}
      content={dbContent}
      liveContent={dbLiveContent}
      alaCarteData={dbAlaCarte}
      alaCarteRanksData={dbAlaCarteRanks}
    />
  );
}
