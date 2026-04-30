-- RLS Policies for Notifications and Push Tokens

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can read their own push tokens
CREATE POLICY "users_can_read_own_push_tokens" ON public.push_tokens
FOR SELECT
USING (user_id = auth.uid());

-- Users can insert their own push tokens
CREATE POLICY "users_can_insert_push_tokens" ON public.push_tokens
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own push tokens
CREATE POLICY "users_can_update_own_push_tokens" ON public.push_tokens
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own push tokens
CREATE POLICY "users_can_delete_own_push_tokens" ON public.push_tokens
FOR DELETE
USING (user_id = auth.uid());

-- Notification Queue RLS
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "users_can_read_own_notifications" ON public.notification_queue
FOR SELECT
USING (user_id = auth.uid());

-- System can insert notifications (via Edge Function)
CREATE POLICY "system_can_insert_notifications" ON public.notification_queue
FOR INSERT
WITH CHECK (TRUE);

-- Admins can read all notifications
CREATE POLICY "admin_can_read_all_notifications" ON public.notification_queue
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid() AND admin_users.is_active = TRUE
  )
);
