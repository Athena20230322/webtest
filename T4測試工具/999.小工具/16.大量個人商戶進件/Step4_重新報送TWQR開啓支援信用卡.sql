DECLARE
	@CustomerID BIGINT,
	@BrandTypeCode varchar(50)

--查詢品牌\通路\商圈代號
SELECT @BrandTypeCode = BrandTypeCode 
FROM [ICP_Admin].[dbo].[Admin_Merchant_BrandType] 
WHERE Status = 1 AND BrandTypeName = 'Yoxi';

DECLARE DataCursor cursor for
	SELECT D.CustomerID
	FROM ICP_Admin.dbo.Admin_Merchant_CustomerData AS D INNER JOIN
	     ICP_Admin.dbo.Admin_Merchant_CustomerData_Apply AS A ON D.Account = A.Account AND D.Pwd=A.Pwd INNER JOIN
		 ICP_Admin.dbo.Admin_Merchant_TWQR_Main AS TM ON TM.CustomerID=D.CustomerID INNER JOIN
		 ICP_Admin.dbo.Admin_Merchant_TWQR_TerminalDetail AS TD ON TD.CustomerID=TM.CustomerID
	WHERE A.ApplyStatus = 4
		  AND A.BrandTypeCode = @BrandTypeCode 
	      AND A.RegisterStatus = 100
		  AND D.AuditStatus = 0
		  AND D.CustomerStatus = 1
		  AND TM.MerchantID like '%Q%'
		  AND TD.QRCode like '%392'+TM.MerchantID+'%'
		  AND TD.Status =2
		   
OPEN DataCursor

FETCH NEXT FROM DataCursor INTO
@CustomerID

WHILE @@FETCH_STATUS =0
BEGIN
	DECLARE
		@NewMerchantID varchar(30),
		@Modifier nvarchar(100) = '' --本次執行修改人

	--取得新的MerchantID
	DECLARE @NextSerialNumber NVARCHAR(4);
	DECLARE @DefaultSerialNumber NVARCHAR(4) = '0001';
	DECLARE @format NVARCHAR(4) = '0000';

	
	-- Return DataResult
	DECLARE
		@RtnCode INT = 0,
		@RtnData NVARCHAR(4),
		@RtnMsg NVARCHAR(1000);

	BEGIN TRY
		DELETE FROM [ICP_Logging].[dbo].[Log_Admin_Merchant_TWQR_SerialNumber]
		WHERE CreateDate < CONVERT (date, GETDATE());

		-- Check if there's no data
		IF NOT EXISTS (
            SELECT TOP 1
            [SerialNumber]
            FROM
            [ICP_Logging].[dbo].[Log_Admin_Merchant_TWQR_SerialNumber]
            WHERE
				SerialNumber NOT LIKE '%Q%'
		)
			BEGIN
				INSERT INTO [ICP_Logging].[dbo].[Log_Admin_Merchant_TWQR_SerialNumber] 
					(SerialNumber) 
				VALUES (@DefaultSerialNumber);
    
				SET @RtnData = @DefaultSerialNumber;
				SET @RtnMsg = '新增成功';
				SET @RtnCode = 1;
		END
		ELSE
			BEGIN
				SELECT TOP 1
					@NextSerialNumber = (FORMAT(ISNULL(CAST(SerialNumber AS INT), 0) + 1, @format))
				FROM 
					[ICP_Logging].[dbo].[Log_Admin_Merchant_TWQR_SerialNumber]
				WHERE
					SerialNumber NOT LIKE '%Q%'
    
				ORDER BY [SerialNumber] DESC;
     
				WHILE   EXISTS (
								SELECT 
									[SerialNumber]
								FROM 
									[ICP_Logging].[dbo].[Log_Admin_Merchant_TWQR_SerialNumber] 
								WHERE 
									[SerialNumber] = @NextSerialNumber
								)
						BEGIN
    
							SELECT TOP 1
								@NextSerialNumber = (FORMAT(ISNULL(CAST(SerialNumber AS INT), 0) + 1, @format))
							FROM 
								[ICP_Logging].[dbo].[Log_Admin_Merchant_TWQR_SerialNumber]
							WHERE
								SerialNumber NOT LIKE '%Q%'
							ORDER BY [SerialNumber] DESC;
      
						END
    
				INSERT INTO [ICP_Logging].[dbo].[Log_Admin_Merchant_TWQR_SerialNumber] 
                    (SerialNumber) 
				VALUES 
                    (@NextSerialNumber);
    
				SET @RtnData = @NextSerialNumber;
				SET @RtnMsg ='新增成功';
				SET @RtnCode = 1;
			END
	END TRY
	BEGIN CATCH
    
		SET @RtnMsg = ERROR_MESSAGE();

	END CATCH;
	DECLARE @MID bigint
	SELECT @MID = MID FROM [ICP_Admin].[dbo].[Admin_Merchant_CustomerData] WHERE CustomerID = @CustomerID
	SET @NewMerchantID = '392' + CAST(@MID AS varchar(16)) + @NextSerialNumber

	SELECT @NewMerchantID
	
	--更新財金主檔
	UPDATE
		[ICP_Admin].[dbo].[Admin_Merchant_TWQR_Main]
	SET
		[MerchantID] = @NewMerchantID,
		[ModifyDate] = GETDATE(),
		[Modifier] = @Modifier
	WHERE
		[CustomerID] = @CustomerID

	--更新財金特店明細檔
	INSERT
		[ICP_Admin].[dbo].[Admin_Merchant_TWQR_MerchantDetail]([CustomerID]
           ,[StoreName_EN]
           ,[CityName_EN]
           ,[NationalityCode]
           ,[ZipCode]
           ,[StoreName_CH]
           ,[Address_EN]
           ,[Address_CH]
           ,[PhoneAearCode]
           ,[PhoneNumber]
           ,[MCCCode]
           ,[StoreType]
           ,[ShortName]
           ,[WebsiteURL]
           ,[Status]
           ,[AppUID]
           ,[CreateDate]
           ,[ModifyDate]
           ,[Modifier]
           ,[MerchantID])
	SELECT TOP 1
			[CustomerID],
			[StoreName_EN],
			[CityName_EN]	,
			[NationalityCode],
			[ZipCode],
			[StoreName_CH],
			[Address_EN],
			[Address_CH],
			[PhoneAearCode],
			[PhoneNumber],
			[MCCCode],
			[StoreType],
			[ShortName],
			[WebsiteURL],
			[Status],
			NULL, --APPUID
			GETDATE(),
			GETDATE(),
			@Modifier,
			@NewMerchantID
	FROM
		[ICP_Admin].[dbo].[Admin_Merchant_TWQR_MerchantDetail]
	WHERE
		[CustomerID] = @CustomerID

	--更新財金端末明細檔
	UPDATE  [ICP_Admin].[dbo].[Admin_Merchant_TWQR_TerminalDetail]
	SET
	    [AppUID] = NULL,
	    [Status]     = 0 , --改回未報送
		[ModifyDate] = GETDATE(),
		[Modifier] = @Modifier
	WHERE
	            [CustomerID] = @CustomerID

	--刪除現有報送資料
	IF NOT EXISTS (
		SELECT 1 FROM
			[ICP_Admin].[dbo].[Admin_Merchant_TWQR_Main] AS Main INNER JOIN
			[ICP_Admin].[dbo].[Admin_Merchant_TWQR_MerchantDetail] AS MerchantDetail ON Main.[CustomerID] = MerchantDetail.[CustomerID]
		WHERE
			Main.[CustomerID] = @CustomerID AND
			Main.[MerchantID] <> MerchantDetail.[MerchantID] AND
			MerchantDetail.[Status] <> 4
			)
			BEGIN
				INSERT INTO
					[ICP_Admin].[dbo].[Admin_Merchant_TWQR_DeclareSchedule]
				([CustomerID], [MerchantID], [TerminalID], [DeclareType], [Status], [CreateDate])
				SELECT
					Main.[CustomerID],
					MerchantDetail.[MerchantID],
					TerminalDetail.[TerminalID],
					3,
					'1',
					GETDATE()
				FROM
					[ICP_Admin].[dbo].[Admin_Merchant_TWQR_Main] AS Main
				INNER JOIN
					[ICP_Admin].[dbo].[Admin_Merchant_TWQR_MerchantDetail] AS MerchantDetail
				ON 
					Main.[CustomerID] = MerchantDetail.[CustomerID]
				INNER JOIN 
					[ICP_Admin].[dbo].[Admin_Merchant_TWQR_TerminalDetail] AS TerminalDetail
				ON 
					Main.[CustomerID] = TerminalDetail.[CustomerID]
				WHERE
					Main.[CustomerID] = @CustomerID AND
					Main.[MerchantID] <> MerchantDetail.[MerchantID] AND
					MerchantDetail.[Status] <> 4 AND
					TerminalDetail.[Status] <> 4
			END

	UPDATE
		[ICP_Admin].[dbo].[Admin_Merchant_TWQR_DeclareSchedule]
	SET
		[Status] = 3,
		[ModifyDate] = GETDATE()
	WHERE
		[CustomerID] = @CustomerID
	AND
		[MerchantID] <> @NewMerchantID
	AND
		[Status] = 1
	
	--建立新的報送資料
	INSERT INTO [ICP_Admin].[dbo].[Admin_Merchant_TWQR_DeclareSchedule]
	([CustomerID], [MerchantID], [TerminalID], [DeclareType], [Status], [CreateDate])
	SELECT
		Main.[CustomerID],
		Main.[MerchantID],
		TerminalDetail.[TerminalID],
		1,
		'1',
		GETDATE()
	FROM
		[ICP_Admin].[dbo].[Admin_Merchant_TWQR_Main] AS Main
	INNER JOIN
		[ICP_Admin].[dbo].[Admin_Merchant_TWQR_MerchantDetail] AS MerchantDetail
	ON 
			Main.[CustomerID] = MerchantDetail.[CustomerID] AND
	        Main.[MerchantID] = MerchantDetail.[MerchantID]
	INNER JOIN
		[ICP_Admin].[dbo].[Admin_Merchant_TWQR_TerminalDetail] AS TerminalDetail
	ON 
		Main.[CustomerID] = TerminalDetail.[CustomerID] 
	WHERE
		Main.[CustomerID] = @CustomerID

	FETCH NEXT FROM DataCursor INTO
	@CustomerID

END
CLOSE DataCursor
DEALLOCATE DataCursor