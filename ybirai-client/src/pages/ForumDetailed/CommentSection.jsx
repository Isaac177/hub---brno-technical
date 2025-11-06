import Comment from './Comment'

export default function CommentSection() {
	return (
		<div className='mb-5'>
			<Comment />
			<Comment isReply={true} />
		</div>
	)
}