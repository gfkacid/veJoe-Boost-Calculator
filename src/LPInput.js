function LPInput({token , LPinputVal, tokenIndex, inputChanged}) {
    
    return (
        <div className="add-liquidity-wrapper">
            <div className="input-wrapper">
                <div className="input-row">
                    <input className="token-amount-input" type="text" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0.0" minLength="1" maxLength="79" spellCheck="false" value={LPinputVal} tokenindex={tokenIndex} onChange={inputChanged}/>
                    <div className="currency">
                        <span className="token-logo">
                            <img src={token.imageURI}/>
                            <span>{token.symbol}</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LPInput;