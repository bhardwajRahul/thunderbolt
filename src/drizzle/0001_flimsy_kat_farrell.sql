CREATE TABLE `email_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`message_id` text NOT NULL,
	`html_body` text NOT NULL,
	`text_body` text NOT NULL,
	`parts` text NOT NULL,
	`subject` text,
	`date` text NOT NULL,
	`from` text NOT NULL,
	`in_reply_to` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_messages_id_unique` ON `email_messages` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `email_messages_message_id_unique` ON `email_messages` (`message_id`);