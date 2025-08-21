const ScheduleEdit = ({onDetail, onSave}) => {
    return (
        <>
            <button onClick={onDetail}>Cancel</button>
            <hr/>
            <input placeholder="Title"/>
            <input placeholder="Date"/>
            <input placeholder="Desciption"/>
            <input type="checkbox" checked/>
            <button onClick={onSave}>Edit</button>
        </>
    )
}

export default ScheduleEdit;