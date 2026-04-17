-- === SEED DATA FOR FORTIV HOTELOS ===
-- Copy and paste this script into your Supabase SQL Editor and click "RUN"
-- This will populate your tables so the HotelOS dashboard and pages come alive with real data!

-- 1. Populate revenue_analytics_daily (Powers Revenue Dashboard charts & KPIs)
INSERT INTO public.revenue_analytics_daily 
(date, total_revenue_inr, room_revenue_inr, ancillary_revenue_inr, upsell_revenue_inr, adr_inr, revpar_inr, revpar_target_inr, occupancy_pct, bookings_direct, bookings_ota, bookings_corporate, ota_commission_paid_inr, direct_booking_ratio_pct)
VALUES 
(CURRENT_DATE - INTERVAL '6 days', 245000, 180000, 45000, 20000, 8500, 6800, 6500, 80, 15, 10, 5, 12000, 50),
(CURRENT_DATE - INTERVAL '5 days', 280000, 200000, 50000, 30000, 9000, 7500, 6500, 85, 20, 12, 6, 14000, 52),
(CURRENT_DATE - INTERVAL '4 days', 210000, 150000, 40000, 20000, 8200, 6200, 6500, 75, 12, 12, 4, 13500, 42),
(CURRENT_DATE - INTERVAL '3 days', 310000, 230000, 55000, 25000, 9500, 8200, 6800, 90, 25, 15, 8, 18000, 52),
(CURRENT_DATE - INTERVAL '2 days', 350000, 260000, 60000, 30000, 9800, 8800, 6800, 95, 30, 10, 10, 11000, 60),
(CURRENT_DATE - INTERVAL '1 days', 290000, 210000, 55000, 25000, 9200, 7800, 7000, 88, 22, 14, 8, 16000, 50),
(CURRENT_DATE, 305000, 220000, 60000, 25000, 9400, 8000, 7000, 89, 24, 12, 9, 14500, 53);

-- 2. Populate occupancy_daily (Powers Occupancy Dashboard charts)
INSERT INTO public.occupancy_daily 
(date, total_rooms, occupied_rooms, occupancy_pct, demand_level, walk_ins, cancellations, no_shows)
VALUES 
(CURRENT_DATE - INTERVAL '6 days', 100, 80, 80, 'High', 5, 2, 1),
(CURRENT_DATE - INTERVAL '5 days', 100, 85, 85, 'High', 8, 1, 0),
(CURRENT_DATE - INTERVAL '4 days', 100, 75, 75, 'Normal', 3, 4, 2),
(CURRENT_DATE - INTERVAL '3 days', 100, 90, 90, 'Peak', 10, 1, 0),
(CURRENT_DATE - INTERVAL '2 days', 100, 95, 95, 'Peak', 12, 0, 0),
(CURRENT_DATE - INTERVAL '1 days', 100, 88, 88, 'High', 6, 2, 1),
(CURRENT_DATE, 100, 89, 89, 'High', 7, 1, 0);

-- 3. Populate local_events (Powers Events Feed)
INSERT INTO public.local_events 
(event_name, event_type, city, date)
VALUES 
('Tech Summit 2026', 'conference', 'Mumbai', CURRENT_DATE + INTERVAL '2 days'),
('Food Festival', 'festival', 'Mumbai', CURRENT_DATE + INTERVAL '5 days'),
('Marathon City Run', 'sports', 'Mumbai', CURRENT_DATE + INTERVAL '12 days'),
('Art Exhibition', 'exhibition', 'Mumbai', CURRENT_DATE + INTERVAL '15 days');

-- 4. Populate room_rates (Powers Pricing Engine)
INSERT INTO public.room_rates (name, units, rate, base_rate, change_pct) VALUES 
('Executive Suite', 12, 24500, 21000, 16),
('Deluxe King', 45, 12500, 11000, 13),
('Standard Twin', 60, 8500, 8500, 0),
('Presidential', 2, 85000, 75000, 13);

-- 5. Populate competitors (Powers Pricing Engine)
INSERT INTO public.competitors (name, room_type, their_rate, our_rate, position) VALUES 
('Taj Palace', 'Deluxe', 14000, 12500, 'Value Advantage'),
('The Oberoi', 'Deluxe', 16500, 12500, 'Value Advantage'),
('Hyatt Regency', 'Deluxe', 12000, 12500, 'Premium'),
('ITC Maurya', 'Deluxe', 12500, 12500, 'Parity'),
('Le Meridien', 'Deluxe', 10500, 12500, 'Premium');

-- 6. Populate bookings (Powers Bookings page)
INSERT INTO public.bookings (booking_ref, guest_name, email, phone, check_in_date, check_out_date, adults, children, booking_source, total_amount_inr, status, purpose, ota_name, ota_commission_pct, whatsapp_opted) VALUES 
('HTL2001', 'Aarav Patel', 'aarav@example.com', '+91 98765 43210', CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days', 2, 0, 'Direct', 37500, 'Checked-in', 'Leisure', NULL, 0, true),
('HTL2002', 'Isha Desai', 'isha@example.com', '+91 98765 43211', CURRENT_DATE, CURRENT_DATE + INTERVAL '2 days', 1, 0, 'Booking.com', 26000, 'Confirmed', 'Business', 'Booking.com', 18, false),
('HTL2003', 'Rohan Kumar', 'rohan@example.com', '+91 98765 43212', CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '4 days', 2, 1, 'MakeMyTrip', 42000, 'Pending', 'Leisure', 'MakeMyTrip', 15, true);

-- 7. Populate corporate_accounts (Powers Corporate page)
INSERT INTO public.corporate_accounts (account_ref, company_name, contact_name, city, monthly_room_nights, rate_negotiated_inr, contract_expiry, account_status, last_contacted, renewal_status) VALUES 
('CORP-INF', 'Infosys', 'Rahul Sharma', 'Bangalore', 150, 8500, '2026-12-31', 'Active', CURRENT_DATE - INTERVAL '10 days', NULL),
('CORP-TCS', 'TCS', 'Priya Singh', 'Mumbai', 200, 8200, '2026-05-15', 'Expiring Soon', CURRENT_DATE - INTERVAL '20 days', 'Pending Call'),
('CORP-HCL', 'HCL Tech', 'Neha Gupta', 'Noida', 90, 8900, '2027-03-31', 'Active', CURRENT_DATE - INTERVAL '30 days', NULL);

-- 8. Populate upsell_offers (Powers Upsells page)
INSERT INTO public.upsell_offers (booking_ref, guest, upgrade, price, channel, sent_at, accepted, revenue, variant) VALUES 
('HTL2001', 'Aarav Patel', 'Deluxe → Executive', '₹2,500/nt', 'WhatsApp', CURRENT_TIMESTAMP - INTERVAL '2 hours', true, '₹7,500', 'A'),
('HTL2002', 'Isha Desai', 'Late Check-out', '₹1,500', 'Email', CURRENT_TIMESTAMP - INTERVAL '1 day', false, '₹0', 'B');

-- 9. Populate pre_arrival_messages (Powers Pre-Arrival page)
INSERT INTO public.pre_arrival_messages (booking_id, message_type, channel, sent_at, delivered, delivery_status, guest_response, revenue_inr, booked, trigger_days_before_checkin) VALUES 
('bk_val_2001', 'Spa Package', 'WhatsApp', CURRENT_TIMESTAMP - INTERVAL '3 days', true, 'Delivered', 'Yes, please book a couples massage for Tuesday.', 5000, true, 3),
('bk_val_2002', 'Airport Transfer', 'Email', CURRENT_TIMESTAMP - INTERVAL '2 days', true, 'Opened', NULL, 0, false, 2);
