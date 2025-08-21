const ScheduleForm = ({onCancel}) => {
    return (
        <>
            <button onClick={onCancel}>cancel</button>


            <input placeholder="title"/>
            <input placeholder="date"/>
            <input placeholder="desciption"/>
            <input type="checkbox"/>isRepeating

        </>)

}

export default ScheduleForm;