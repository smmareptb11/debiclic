import './station-comment.css'

export default function StationComment({ comment }) {
	return (
		<div className="station-comment">
			<span className="station-comment-text">{comment}</span>
		</div>
	)
}
