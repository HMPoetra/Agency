// lib/queries.js
// Semua query database ke Neon — dipakai oleh Server Components & Server Actions
import { sql } from "./db";

/* ── STATS ─────────────────────────────── */
export async function getStats() {
  return sql`SELECT label, value, suffix, sort_order
             FROM site_stats ORDER BY sort_order`;
}

/* ── PILLARS ────────────────────────────── */
export async function getPillars() {
  return sql`SELECT id, icon_name, title, description, sort_order
             FROM company_pillars ORDER BY sort_order`;
}

/* ── DIVISIONS ──────────────────────────── */
export async function getDivisions() {
  const divs = await sql`
    SELECT d.*, COALESCE(
      JSON_AGG(df.feature ORDER BY df.sort_order) FILTER (WHERE df.id IS NOT NULL),
      '[]'
    ) AS features
    FROM divisions d
    LEFT JOIN division_features df ON df.division_id = d.id
    GROUP BY d.id ORDER BY d.id`;
  return divs;
}

export async function getDivisionById(id) {
  const rows = await sql`SELECT * FROM divisions WHERE id = ${id}`;
  return rows[0] ?? null;
}

export async function createDivision(payload) {
  const { name, tag, description, photo_url, is_visible_on_dashboard } = payload;
  const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const finalTag = (tag || id.substring(0, 3)).toUpperCase();
  const visible = is_visible_on_dashboard ?? true;
  const rows = await sql`
    INSERT INTO divisions (id, name, tag, unit, accent, icon_name, description, photo_url, is_visible_on_dashboard) 
    VALUES (${id}, ${name}, ${finalTag}, 'General', 'slate', 'Shield', ${description || '-'}, ${photo_url || ''}, ${visible}) 
    RETURNING *`;
  return rows[0];
}

export async function updateDivision(id, payload) {
  const { name, tag, description, photo_url, is_visible_on_dashboard } = payload;
  const finalTag = tag ? tag.toUpperCase() : null;
  const visible = is_visible_on_dashboard ?? true;
  const rows = await sql`
    UPDATE divisions SET
      name = ${name},
      tag = COALESCE(${finalTag}, tag),
      description = ${description || '-'},
      photo_url = ${photo_url || ''},
      is_visible_on_dashboard = ${visible}
    WHERE id = ${id}
    RETURNING *`;
  return rows[0];
}

export async function deleteDivision(id) {
  await sql`DELETE FROM divisions WHERE id = ${id}`;
}

/* ── RANKS ──────────────────────────────── */
export async function getRanks() {
  return sql`SELECT * FROM ranks ORDER BY created_at ASC`;
}

export async function createRank(name) {
  const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const rows = await sql`
    INSERT INTO ranks (id, name) VALUES (${id}, ${name}) RETURNING *`;
  return rows[0];
}

export async function deleteRank(id) {
  await sql`DELETE FROM ranks WHERE id = ${id}`;
}

/* ── OFFICERS ───────────────────────────── */
export async function getOfficers() {
  return sql`
    SELECT *
    FROM officers
    ORDER BY id`;
}

export async function getOfficersWithHours() {
  return sql`
    SELECT o.*,
           COALESCE(SUM(a.duration_minutes), 0) AS attendance_minutes
    FROM officers o
    LEFT JOIN attendance a ON o.id = a.officer_id
    GROUP BY o.id
    ORDER BY o.id`;
}

export async function getOfficerById(id) {
  const rows = await sql`SELECT * FROM officers WHERE id = ${id}`;
  return rows[0] ?? null;
}

export async function updateOfficerManualMinutes(id, manual_minutes) {
  const rows = await sql`
    UPDATE officers SET
      manual_minutes = ${manual_minutes},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *`;
  return rows[0];
}

export async function createOfficer(data) {
  const latest = await sql`SELECT id FROM officers ORDER BY id DESC LIMIT 1`;
  let newId = "COP-s_001";
  if (latest.length > 0) {
    const match = latest[0].id.match(/\d+$/);
    if (match) {
      const num = parseInt(match[0], 10);
      newId = `COP-s_${String(num + 1).padStart(3, "0")}`;
    }
  }

  const rows = await sql`
    INSERT INTO officers
      (id, full_name, callsign, rank, division, status, gender, unit_task, notes)
    VALUES
      (${newId}, ${data.full_name}, ${data.callsign}, ${data.rank},
       ${data.division}, ${data.status}, ${data.gender}, ${data.unit_task}, ${data.notes})
    RETURNING *`;
  return rows[0];
}

export async function updateOfficer(id, data) {
  const rows = await sql`
    UPDATE officers SET
      full_name        = ${data.full_name},
      callsign         = ${data.callsign},
      rank             = ${data.rank},
      division         = ${data.division},
      status           = ${data.status},
      gender           = ${data.gender},
      unit_task        = ${data.unit_task},
      notes            = ${data.notes},
      updated_at       = NOW()
    WHERE id = ${id}
    RETURNING *`;
  return rows[0];
}

export async function deleteOfficer(id) {
  await sql`DELETE FROM users WHERE officer_id = ${id}`;
  await sql`DELETE FROM officers WHERE id = ${id}`;
}

/* ── CONTRACTS ──────────────────────────── */
export async function getContracts() {
  return sql`SELECT * FROM contracts ORDER BY created_at DESC`;
}

export async function createContract(data) {
  const rows = await sql`
    INSERT INTO contracts (mou_code, server_name, status, detail, personnel_count, signed_at, photo_url)
    VALUES (${data.mou_code}, ${data.server_name}, ${data.status},
            ${data.detail}, ${data.personnel_count}, ${data.signed_at}, ${data.photo_url || null})
    RETURNING *`;
  return rows[0];
}

export async function updateContract(id, data) {
  const rows = await sql`
    UPDATE contracts SET
      server_name     = ${data.server_name},
      status          = ${data.status},
      detail          = ${data.detail},
      personnel_count = ${data.personnel_count},
      signed_at       = ${data.signed_at},
      photo_url       = ${data.photo_url || null},
      updated_at      = NOW()
    WHERE id = ${id} RETURNING *`;
  return rows[0];
}

export async function deleteContract(id) {
  await sql`DELETE FROM contracts WHERE id = ${id}`;
}

/* ── PRICING ────────────────────────────── */
export async function getPricingTiers() {
  const tiers = await sql`
    SELECT pt.*, COALESCE(
      JSON_AGG(pf.feature ORDER BY pf.sort_order) FILTER (WHERE pf.id IS NOT NULL),
      '[]'
    ) AS features
    FROM pricing_tiers pt
    LEFT JOIN pricing_features pf ON pf.pricing_tier_id = pt.id
    GROUP BY pt.id ORDER BY pt.sort_order`;
  return tiers;
}

export async function createPricingTier(data) {
  const rows = await sql`
    INSERT INTO pricing_tiers (name, tag, icon_name, price_idr, billing_period, is_popular, cta_label, sort_order)
    VALUES (${data.name}, ${data.tag}, ${data.icon_name}, ${data.price_idr}, ${data.billing_period}, ${data.is_popular}, ${data.cta_label}, ${data.sort_order})
    RETURNING *`;
  return rows[0];
}

export async function updatePricingTier(id, data) {
  const rows = await sql`
    UPDATE pricing_tiers SET
      name = ${data.name},
      tag = ${data.tag},
      icon_name = ${data.icon_name},
      price_idr = ${data.price_idr},
      billing_period = ${data.billing_period},
      is_popular = ${data.is_popular},
      cta_label = ${data.cta_label},
      sort_order = ${data.sort_order}
    WHERE id = ${id}
    RETURNING *`;
  return rows[0];
}

export async function deletePricingTier(id) {
  await sql`DELETE FROM pricing_tiers WHERE id = ${id}`;
}

/* ── PRODUCTS ───────────────────────────── */
export async function getProducts() {
  const prods = await sql`
    SELECT p.*, COALESCE(
      JSON_AGG(pf.feature ORDER BY pf.sort_order) FILTER (WHERE pf.id IS NOT NULL),
      '[]'
    ) AS features
    FROM products p
    LEFT JOIN product_features pf ON pf.product_id = p.id
    WHERE p.is_active = TRUE
    GROUP BY p.id ORDER BY p.price_idr DESC`;
  return prods;
}

export async function getAllProducts() {
  const prods = await sql`
    SELECT p.*, COALESCE(
      JSON_AGG(pf.feature ORDER BY pf.sort_order) FILTER (WHERE pf.id IS NOT NULL),
      '[]'
    ) AS features
    FROM products p
    LEFT JOIN product_features pf ON pf.product_id = p.id
    GROUP BY p.id ORDER BY p.created_at DESC`;
  return prods;
}

export async function createProduct(data) {
  const rows = await sql`
    INSERT INTO products (title, category, description, price_idr, photo_urls, video_url, is_active)
    VALUES (${data.title}, ${data.category}, ${data.description}, ${data.price_idr}, ${data.photo_urls}, ${data.video_url}, ${data.is_active})
    RETURNING *`;
  
  const product = rows[0];
  
  if (data.features && data.features.length > 0) {
    for (let i = 0; i < data.features.length; i++) {
      await sql`INSERT INTO product_features (product_id, feature, sort_order) VALUES (${product.id}, ${data.features[i]}, ${i})`;
    }
  }
  
  return product;
}

export async function updateProduct(id, data) {
  const rows = await sql`
    UPDATE products SET
      title = ${data.title},
      category = ${data.category},
      description = ${data.description},
      price_idr = ${data.price_idr},
      photo_urls = ${data.photo_urls},
      video_url = ${data.video_url},
      is_active = ${data.is_active}
    WHERE id = ${id}
    RETURNING *`;
    
  if (data.features) {
    await sql`DELETE FROM product_features WHERE product_id = ${id}`;
    for (let i = 0; i < data.features.length; i++) {
      await sql`INSERT INTO product_features (product_id, feature, sort_order) VALUES (${id}, ${data.features[i]}, ${i})`;
    }
  }
  
  return rows[0];
}

export async function deleteProduct(id) {
  await sql`DELETE FROM product_features WHERE product_id = ${id}`;
  await sql`DELETE FROM products WHERE id = ${id}`;
}

/* ── REVIEWS ────────────────────────────── */
export async function getPublishedReviews() {
  return sql`SELECT * FROM reviews WHERE is_published = TRUE ORDER BY created_at DESC`;
}

export async function getAllReviews() {
  return sql`SELECT * FROM reviews ORDER BY created_at DESC`;
}

export async function createReview(data) {
  const rows = await sql`
    INSERT INTO reviews (name_server, rating, message)
    VALUES (${data.name_server}, ${data.rating}, ${data.message})
    RETURNING *`;
  return rows[0];
}

export async function updateReview(id, data) {
  const rows = await sql`
    UPDATE reviews SET
      name_server = ${data.name_server},
      rating = ${data.rating},
      message = ${data.message},
      is_published = ${data.is_published}
    WHERE id = ${id}
    RETURNING *`;
  return rows[0];
}

export async function deleteReview(id) {
  await sql`DELETE FROM reviews WHERE id = ${id}`;
}

export async function toggleReviewPublish(id, is_published) {
  await sql`UPDATE reviews SET is_published = ${is_published} WHERE id = ${id}`;
}

/* ── USERS ──────────────────────────────── */
export async function getUserByUsername(username) {
  const rows = await sql`
    SELECT * FROM users WHERE username = ${username} LIMIT 1`;
  return rows[0] ?? null;
}

export async function createUser(data) {
  const rows = await sql`
    INSERT INTO users (username, password_hash, role, officer_id)
    VALUES (${data.username}, ${data.password_hash}, ${data.role}, ${data.officer_id ?? null})
    RETURNING id, username, role, officer_id, created_at`;
  return rows[0];
}

export async function getUsers() {
  return sql`
    SELECT u.id, u.username, u.role, u.created_at, u.officer_id,
           o.full_name AS officer_name
    FROM users u
    LEFT JOIN officers o ON o.id = u.officer_id
    ORDER BY u.created_at DESC`;
}

export async function deleteUser(id) {
  await sql`DELETE FROM users WHERE id = ${id}`;
}

export async function updateOfficerPersonal(id, data) {
  const rows = await sql`
    UPDATE officers SET
      full_name = ${data.full_name},
      callsign = ${data.callsign},
      rank = ${data.rank},
      division = ${data.division},
      gender = ${data.gender || '-'},
      unit_task = ${data.unit_task || '-'},
      notes = ${data.notes || '-'},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *`;
  return rows[0];
}

export async function updateUserPassword(userId, passwordHash) {
  await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${userId}`;
}

export async function getUserById(userId) {
  const rows = await sql`SELECT * FROM users WHERE id = ${userId} LIMIT 1`;
  return rows[0] ?? null;
}

/* ── ABSENSI ────────────────────────────── */
export async function getAttendance({ limit = 50, officerId = null } = {}) {
  if (officerId) {
    return sql`
      SELECT a.*, o.full_name, o.callsign
      FROM attendance a
      JOIN officers o ON o.id = a.officer_id
      WHERE a.officer_id = ${officerId}
      ORDER BY a.checked_in_at DESC LIMIT ${limit}`;
  }
  return sql`
    SELECT a.*, o.full_name, o.callsign, o.division
    FROM attendance a
    JOIN officers o ON o.id = a.officer_id
    ORDER BY a.checked_in_at DESC LIMIT ${limit}`;
}

export async function createAttendance(officerId, note = "") {
  const rows = await sql`
    INSERT INTO attendance (officer_id, note)
    VALUES (${officerId}, ${note})
    RETURNING *`;
  return rows[0];
}

export async function checkoutAttendance(id) {
  const rows = await sql`
    UPDATE attendance
    SET checked_out_at = NOW(),
        duration_minutes = EXTRACT(EPOCH FROM (NOW() - checked_in_at)) / 60
    WHERE id = ${id} AND checked_out_at IS NULL
    RETURNING *`;
  return rows[0];
}

export async function updateAttendance(id, data) {
  let duration_minutes = null;
  const d1 = new Date(data.checked_in_at);
  const d2 = data.checked_out_at ? new Date(data.checked_out_at) : null;

  if (d2) {
    duration_minutes = Math.round((d2.getTime() - d1.getTime()) / 60000);
  }

  if (duration_minutes !== null) {
    await sql`
      UPDATE attendance
      SET checked_in_at = ${d1.toISOString()},
          checked_out_at = ${d2.toISOString()},
          duration_minutes = ${duration_minutes}
      WHERE id = ${id}
    `;
  } else {
    await sql`
      UPDATE attendance
      SET checked_in_at = ${d1.toISOString()},
          checked_out_at = null,
          duration_minutes = null
      WHERE id = ${id}
    `;
  }
}

export async function deleteAttendance(id) {
  await sql`DELETE FROM attendance WHERE id = ${id}`;
}

export async function getTodayAttendance(officerId) {
  const rows = await sql`
    SELECT * FROM attendance
    WHERE officer_id = ${officerId}
      AND checked_in_at::date = CURRENT_DATE
    ORDER BY checked_in_at DESC LIMIT 1`;
  return rows[0] ?? null;
}

/* ── DASHBOARD SUMMARY ──────────────────── */
export async function getDashboardSummary() {
  const [officers, contracts, attendance] = await Promise.all([
    sql`SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'Active')  AS active,
          COUNT(*) FILTER (WHERE status = 'On-Duty') AS on_duty,
          COUNT(*) FILTER (WHERE status = 'Standby') AS standby
        FROM officers`,
    sql`SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'Active')  AS active,
          COUNT(*) FILTER (WHERE status = 'Pending') AS pending
        FROM contracts`,
    sql`SELECT COUNT(*) AS today
        FROM attendance
        WHERE checked_in_at::date = CURRENT_DATE`,
  ]);
  return {
    officers: officers[0],
    contracts: contracts[0],
    attendance: attendance[0],
  };
}
