--BEGIN TRAN
DECLARE
    @Account		varchar(200),  -- 商戶帳號
	@Pwd			varchar(200),  -- 商戶密碼
	@BrandTypeCode varchar(50)
	
SELECT @BrandTypeCode = BrandTypeCode 
FROM [ICP_Admin].[dbo].[Admin_Merchant_BrandType] 
WHERE Status = 1 AND BrandTypeName = 'Yoxi';

DECLARE DataCursor cursor for
	SELECT Account,
		   Pwd
	FROM ICP_Admin.dbo.Admin_Merchant_CustomerData_Apply
	WHERE 
		  BrandTypeCode = @BrandTypeCode 
		  AND RegisterStatus = 100
		  AND ApplyStatus = 4
		  AND ModifyDate > CONVERT(DATE,GETDATE(),111)
          AND ModifyDate <= GETDATE()

OPEN DataCursor

FETCH NEXT FROM DataCursor INTO
@Account,
@Pwd;

WHILE  @@FETCH_STATUS = 0
BEGIN
	
	IF(
		SELECT DISTINCT f.ChargeFeeRate
		FROM ICP_Admin.dbo.Admin_Merchant_CustomerData cd INNER JOIN 
			 ICP_Admin.dbo.Admin_Merchant_FunctionChargeFee f ON cd.CustomerID  = f.CustomerID 
		WHERE Category = 1
			  AND cd.Account = @Account
		      AND cd.Pwd = @Pwd
	) > 2
	BEGIN
		--更新Admin
		UPDATE f
		SET f.ChargeFeeRate = 2.0,f.ChargeType = 1 --商戶手續費（電支餘額、ACL、信用卡）調整成2.0%
		FROM ICP_Admin.dbo.Admin_Merchant_CustomerData cd INNER JOIN 
			 ICP_Admin.dbo.Admin_Merchant_FunctionChargeFee f ON cd.CustomerID  = f.CustomerID 
		WHERE Category = 1
			  AND cd.Account = @Account
		      AND cd.Pwd = @Pwd
	
		INSERT INTO [ICP_Logging].[dbo].[Log_Admin_Merchant_FunctionChargeFee]
		(
			[CustomerID],	[MID],	[Category],	[PaymentTypeID],	[ChargeType],	[ChargeFeeRate],	[LowerLimit],	[UpperLimit],	[CreateDate],	[CreateUser],	[RealIP],	[ProxyIP]
		)
		SELECT f.CustomerID,f.MID,f.Category,f.PaymentTypeID,f.ChargeType,f.ChargeFeeRate,f.LowerLimit,f.UpperLimit,dateadd(HH,8,GETUTCDATE()),'SYSTEM',0,0
		FROM ICP_Admin.dbo.Admin_Merchant_CustomerData cd INNER JOIN 
			 ICP_Admin.dbo.Admin_Merchant_FunctionChargeFee f ON cd.CustomerID  = f.CustomerID
		WHERE Category = 1
			  AND cd.Account = @Account
		      AND cd.Pwd = @Pwd
	END
	IF(
		SELECT DISTINCT f.ChargeFeeRate
		FROM ICP_Admin.dbo.Admin_Merchant_CustomerData cd INNER JOIN 
			 ICP_Payment.dbo.Payment_Merchant_FunctionChargeFee f ON cd.MID = f.MID
		WHERE Category = 1
			  AND cd.Account = @Account
		      AND cd.Pwd = @Pwd
	) > 2	
	BEGIN
		--更新Payment
		UPDATE f
		SET f.ChargeFeeRate = 2.0,f.ChargeType = 1 --商戶手續費（電支餘額、ACL、信用卡）調整成2.0%
		FROM ICP_Admin.dbo.Admin_Merchant_CustomerData cd INNER JOIN 
			 ICP_Payment.dbo.Payment_Merchant_FunctionChargeFee f ON cd.MID = f.MID
		WHERE Category = 1
			  AND cd.Account = @Account
		      AND cd.Pwd = @Pwd
	
		INSERT INTO [ICP_Logging].[dbo].[Log_Payment_Merchant_FunctionChargeFee]
		(
			[MID],	[Category],	[PaymentTypeID],	[ChargeType],	[ChargeFeeRate],	[LowerLimit],	[UpperLimit],	[CreateDate],	[CreateUser],	[RealIP],	[ProxyIP]
		)
		SELECT f.MID,f.Category,f.PaymentTypeID,f.ChargeType,f.ChargeFeeRate,f.LowerLimit,f.UpperLimit,dateadd(HH,8,GETUTCDATE()),'SYSTEM',0,0
		FROM ICP_Admin.dbo.Admin_Merchant_CustomerData cd inner join
			 ICP_Payment.dbo.Payment_Merchant_FunctionChargeFee f on cd.MID = f.MID
		WHERE Category = 1
			  AND cd.Account = @Account
		      AND cd.Pwd = @Pwd
	END
	
	IF(
		SELECT DISTINCT f.ChargeFeeRate
		FROM ICP_Admin.dbo.Admin_Merchant_CustomerData cd INNER JOIN 
			 ICP_Admin.dbo.Admin_Merchant_TWQR_Main f ON cd.CustomerID = f.CustomerID
		WHERE cd.Account = @Account
		      AND cd.Pwd = @Pwd
	) > 2
	BEGIN
		--更新TWQR
		UPDATE f
		SET f.ChargeFeeRate = 2.0,f.AllowCreditCard=1 --商戶手續費（電支餘額、ACL、信用卡）調整成2.0%
		FROM ICP_Admin.dbo.Admin_Merchant_CustomerData cd inner join
		ICP_Admin.dbo.Admin_Merchant_TWQR_Main f on cd.CustomerID=f.CustomerID
		WHERE cd.Account = @Account
		      AND cd.Pwd = @Pwd
	END
	
	
	FETCH NEXT FROM DataCursor INTO
	@Account,
	@Pwd;
END

close DataCursor
deallocate DataCursor

