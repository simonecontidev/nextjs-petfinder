-- CreateIndex
CREATE INDEX "idx_comment_listing" ON "Comment"("listingId");

-- CreateIndex
CREATE INDEX "idx_comment_user" ON "Comment"("userId");
