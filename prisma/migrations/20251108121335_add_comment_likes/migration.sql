-- RedefineIndex
DROP INDEX "idx_like_user";
CREATE INDEX "CommentLike_userId_idx" ON "CommentLike"("userId");

-- RedefineIndex
DROP INDEX "idx_like_comment";
CREATE INDEX "CommentLike_commentId_idx" ON "CommentLike"("commentId");
