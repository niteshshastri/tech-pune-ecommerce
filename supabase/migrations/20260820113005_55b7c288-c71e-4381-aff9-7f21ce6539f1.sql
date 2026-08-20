delete from public.payment_records where order_id in (select id from public.orders where customer_name = 'Test Buyer');
delete from public.order_items where order_id in (select id from public.orders where customer_name = 'Test Buyer');
delete from public.orders where customer_name = 'Test Buyer';
delete from public.user_roles where user_id in (select id from auth.users where email in ('qa.admin.ats@gmail.com','qa.tester.ats@gmail.com'));
delete from public.profiles where id in (select id from auth.users where email in ('qa.admin.ats@gmail.com','qa.tester.ats@gmail.com'));
delete from auth.users where email in ('qa.admin.ats@gmail.com','qa.tester.ats@gmail.com');