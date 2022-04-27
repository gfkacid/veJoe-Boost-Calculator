function veJoeInput({value, calcCallback}) {

    return (
        <div className="add-liquidity-wrapper">
            <div className="input-wrapper">
                <div className="input-row">
                    <input className="token-amount-input" type="text" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0.0" minLength="1" maxLength="79" spellCheck="false" value={value} onChange={calcCallback}/>
                    <div className="currency">
                        <span>
                            <img src="/veJoe.png"/>
                            <span>veJOE</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default veJoeInput;